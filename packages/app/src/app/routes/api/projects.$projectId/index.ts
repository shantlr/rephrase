import { createFileRoute } from '@tanstack/react-router';
import {
  extractBearerToken,
  getAccessibleBranchIdsForProject,
  resolveApiToken,
  tokenHasProjectScope,
} from '@/server/common/api-tokens';
import { db } from '@/server/data';
import { ProjectRepo } from '@/server/data/repo/project';

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

export const Route = createFileRoute('/api/projects/$projectId/')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const auth = await authenticate(request);
        if ('error' in auth) {
          return auth.error;
        }

        const projectId = params.projectId;

        if (!tokenHasProjectScope(auth.token, projectId, 'read')) {
          return jsonResponse(403, { error: 'forbidden' });
        }

        const project = await ProjectRepo.query.findById(projectId);

        if (!project) {
          return jsonResponse(404, { error: 'project_not_found' });
        }

        const accessibleBranchIds = getAccessibleBranchIdsForProject(
          auth.token,
          project.id,
          'read',
        );

        const branchesQuery = db
          .selectFrom('project_wording_branch')
          .select(['id', 'name', 'locked', 'created_at'])
          .where('project_id', '=', project.id)
          .where('archived_at', 'is', null)
          .orderBy('created_at', 'asc');

        const branches =
          accessibleBranchIds === null
            ? await branchesQuery.execute()
            : accessibleBranchIds.length === 0
              ? []
              : await branchesQuery
                  .where('id', 'in', accessibleBranchIds)
                  .execute();

        const localeSourceBranchId =
          branches.find((branch) => branch.name === 'main')?.id ||
          branches[0]?.id;

        let locales: string[] = [];
        if (localeSourceBranchId) {
          const localeBranch = await db
            .selectFrom('project_wording_branch')
            .select(['data'])
            .where('id', '=', localeSourceBranchId)
            .executeTakeFirst();

          locales = localeBranch?.data?.locales?.map((l) => l.tag) ?? [];
        }

        return jsonResponse(200, {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            locales,
            branches: branches.map((branch) => ({
              id: branch.id,
              name: branch.name,
              locked: branch.locked,
              isDefault: branch.name === 'main',
            })),
          },
        });
      },
    },
  },
});
