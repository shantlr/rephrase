import { createFileRoute } from '@tanstack/react-router';
import {
  extractBearerToken,
  resolveApiToken,
  tokenHasBranchScope,
} from '@/server/common/api-tokens';
import { db } from '@/server/data';
import { ProjectWordingRepo } from '@/server/data/repo/project-wording';
import type { WordingData } from '@/server/data/wording.types';

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

        let body: { schema?: WordingData['schema'] };
        try {
          body = await request.json();
        } catch {
          return jsonResponse(400, { error: 'invalid_json_body' });
        }

        if (!body.schema) {
          return jsonResponse(400, { error: 'missing_schema_field' });
        }

        // Basic validation of schema structure
        if (
          typeof body.schema !== 'object' ||
          !body.schema.nodes ||
          !body.schema.root
        ) {
          return jsonResponse(400, { error: 'invalid_schema_structure' });
        }

        const updatedData: WordingData = {
          ...branch.data,
          schema: body.schema,
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
