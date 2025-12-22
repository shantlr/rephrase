import { createFileRoute } from '@tanstack/react-router';
import {
  extractBearerToken,
  getAccessibleBranchIdsForProject,
  getProjectIdsForScope,
  resolveApiToken,
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

export const Route = createFileRoute('/api/projects/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticate(request);
        if ('error' in auth) {
          return auth.error;
        }

        const projectIds = getProjectIdsForScope(auth.token, 'read');

        if (projectIds.length === 0) {
          return jsonResponse(200, { projects: [] });
        }

        const projects = await ProjectRepo.query.findByProjectIds(projectIds);

        const projectsWithDetails = await Promise.all(
          projects.map(async (project) => {
            const mainBranch = await db
              .selectFrom('project_wording_branch')
              .select(['id', 'data'])
              .where('project_id', '=', project.id)
              .where('name', '=', 'main')
              .where('archived_at', 'is', null)
              .executeTakeFirst();

            const accessibleBranchIds = getAccessibleBranchIdsForProject(
              auth.token,
              project.id,
              'read',
            );

            const branchesQuery = db
              .selectFrom('project_wording_branch')
              .select(['id', 'name', 'locked'])
              .where('project_id', '=', project.id)
              .where('archived_at', 'is', null);

            const branches =
              accessibleBranchIds === null
                ? await branchesQuery.execute()
                : accessibleBranchIds.length === 0
                  ? []
                  : await branchesQuery
                      .where('id', 'in', accessibleBranchIds)
                      .execute();

            return {
              id: project.id,
              name: project.name,
              description: project.description,
              createdAt: project.created_at,
              updatedAt: project.updated_at,
              locales: mainBranch?.data?.locales?.map((l) => l.tag) ?? [],
              branches: branches.map((branch) => ({
                id: branch.id,
                name: branch.name,
                locked: branch.locked,
                isDefault: branch.name === 'main',
              })),
            };
          }),
        );

        return jsonResponse(200, { projects: projectsWithDetails });
      },
    },
  },
});
