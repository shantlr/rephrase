import { createFileRoute } from '@tanstack/react-router';
import {
  extractBearerToken,
  resolveApiToken,
  tokenHasBranchScope,
} from '@/server/common/api-tokens';
import { db } from '@/server/data';
import { ProjectWordingRepo } from '@/server/data/repo/project-wording';
import type { WordingData } from '@/server/data/wording.types';
import { z } from 'zod';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

const authenticate = async (request: Request) => {
  const rawToken = extractBearerToken(request);
  if (!rawToken) {
    return {
      error: jsonResponse(401, { error: 'missing_authorization_header' }),
    };
  }

  const token = await resolveApiToken(rawToken);

  if (!token) {
    return { error: jsonResponse(401, { error: 'invalid_or_expired_token' }) };
  }

  return { token } as const;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Zod validators for constants
const constantNameValidator = z.string().regex(/^[A-Z0-9_]+$/);

const enumConstantValidator = z.object({
  type: z.literal('enum'),
  name: constantNameValidator,
  description: z.string().optional(),
  options: z.array(z.string()),
});

const stringConstantValidator = z.object({
  type: z.literal('string'),
  name: constantNameValidator,
  description: z.string().optional(),
  value: z.string(),
});

const constantValidator = z.discriminatedUnion('type', [
  enumConstantValidator,
  stringConstantValidator,
]);

// Schema node validators (recursive)
const schemaStringNodeValidator = z.object({
  type: z.literal('string'),
  params: z
    .record(
      z.string(),
      z.object({
        type: z.enum(['string', 'number']),
      }),
    )
    .optional(),
  pluralized: z.boolean().optional(),
  html: z.boolean().optional(),
});

const schemaNumberNodeValidator = z.object({
  type: z.literal('number'),
});

const schemaBooleanNodeValidator = z.object({
  type: z.literal('boolean'),
});

// Use lazy for recursive types
const schemaNodeValidator: z.ZodType<unknown> = z.lazy(() =>
  z.discriminatedUnion('type', [
    schemaStringNodeValidator,
    schemaNumberNodeValidator,
    schemaBooleanNodeValidator,
    schemaArrayNodeValidator,
    schemaObjectNodeValidator,
  ]),
);

const schemaArrayNodeValidator = z.object({
  type: z.literal('array'),
  itemType: z.lazy(() => schemaNodeValidator),
});

// Field validators
const staticFieldValidator = z.object({
  name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  type: z.lazy(() => schemaNodeValidator),
});

const templatedFieldValidator = z.object({
  name: z.string().regex(/^[a-zA-Z0-9${}_-]+$/),
  nameParams: z.record(
    constantNameValidator,
    z.object({
      type: z.literal('constant'),
      id: constantNameValidator,
    }),
  ),
  type: z.lazy(() => schemaNodeValidator),
});

const schemaFieldValidator = z.union([
  templatedFieldValidator,
  staticFieldValidator,
]);

const schemaObjectNodeValidator = z.object({
  type: z.literal('object'),
  fields: z.array(schemaFieldValidator),
});

// Full body validator - schema is now directly a SchemaObjectNode
const updateBranchBodyValidator = z.object({
  schema: schemaObjectNodeValidator,
  constants: z.array(constantValidator).optional(),
});

export const Route = createFileRoute(
  '/api/projects/$projectId/branch/$branchId/',
)({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const auth = await authenticate(request);
        if ('error' in auth) {
          return auth.error;
        }

        const { projectId, branchId: branchIdOrName } = params;

        // Support both branch ID (UUID) and branch name
        const isUuid = UUID_REGEX.test(branchIdOrName);

        const branch = await db
          .selectFrom('project_wording_branch')
          .select([
            'id',
            'project_id',
            'name',
            'locked',
            'hash',
            'data',
            'created_at',
            'updated_at',
          ])
          .where(isUuid ? 'id' : 'name', '=', branchIdOrName)
          .where('project_id', '=', projectId)
          .where('archived_at', 'is', null)
          .executeTakeFirst();

        if (!branch) {
          return jsonResponse(404, { error: 'branch_not_found' });
        }

        // Check token scope with the actual branch ID
        if (!tokenHasBranchScope(auth.token, projectId, branch.id, 'read')) {
          return jsonResponse(403, { error: 'forbidden' });
        }

        return jsonResponse(200, {
          branch: {
            id: branch.id,
            projectId: branch.project_id,
            name: branch.name,
            locked: branch.locked,
            hash: branch.hash,
            data: branch.data,
            createdAt: branch.created_at,
            updatedAt: branch.updated_at,
          },
        });
      },

      PUT: async ({ params, request }) => {
        const auth = await authenticate(request);
        if ('error' in auth) {
          return auth.error;
        }

        const { projectId, branchId: branchIdOrName } = params;

        // Support both branch ID (UUID) and branch name
        const isUuid = UUID_REGEX.test(branchIdOrName);

        const branch = await db
          .selectFrom('project_wording_branch')
          .select(['id', 'project_id', 'data', 'locked'])
          .where(isUuid ? 'id' : 'name', '=', branchIdOrName)
          .where('project_id', '=', projectId)
          .where('archived_at', 'is', null)
          .executeTakeFirst();

        if (!branch) {
          return jsonResponse(404, { error: 'branch_not_found' });
        }

        // Check token scope with the actual branch ID - requires write permission
        if (!tokenHasBranchScope(auth.token, projectId, branch.id, 'write')) {
          return jsonResponse(403, { error: 'forbidden' });
        }

        if (branch.locked) {
          return jsonResponse(400, { error: 'branch_is_locked' });
        }

        // Parse JSON body
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return jsonResponse(400, { error: 'invalid_json_body' });
        }

        // Validate body with Zod
        const parseResult = updateBranchBodyValidator.safeParse(rawBody);
        if (!parseResult.success) {
          return jsonResponse(400, {
            error: 'validation_error',
            details: parseResult.error.issues,
          });
        }

        const body = parseResult.data;
        const constants = body.constants ?? branch.data.constants ?? [];

        const updatedData: WordingData = {
          ...branch.data,
          schema: body.schema as WordingData['schema'],
          constants,
        };

        try {
          await ProjectWordingRepo.mutate.updateBranch({
            branchId: branch.id,
            data: updatedData,
          });
        } catch {
          // updateBranch throws if branch is locked or not found
          return jsonResponse(400, { error: 'update_failed' });
        }

        return jsonResponse(200, { success: true });
      },
    },
  },
});
