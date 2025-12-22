import { createFileRoute } from '@tanstack/react-router';
import {
  extractBearerToken,
  resolveApiToken,
  tokenHasBranchScope,
} from '@/server/common/api-tokens';
import { db } from '@/server/data';

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
    },
  },
});
