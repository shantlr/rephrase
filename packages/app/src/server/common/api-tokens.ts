import { createHash } from 'crypto';
import {
  ApiToken,
  ApiTokenResource,
  ApiTokenScope,
} from '@/server/data/api-token.types';
import { ApiTokenRepo } from '@/server/data/repo/api-token';

export type ResolvedApiToken = ApiToken & {
  resources: ApiTokenResource[];
};

const normalizeResources = (
  resources: ApiToken['resources'],
): ApiTokenResource[] => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources.map((resource) => ({
    project_id: resource.project_id,
    branch_id: resource.branch_id ?? null,
    scopes: Array.from(new Set(resource.scopes)),
  }));
};

export const hashApiToken = (token: string) =>
  createHash('sha256').update(token, 'utf8').digest('hex');

export const resolveApiToken = async (
  rawToken: string,
): Promise<ResolvedApiToken | null> => {
  const token = rawToken.trim();
  if (!token) {
    return null;
  }

  const tokenHash = hashApiToken(token);
  const apiToken = await ApiTokenRepo.query.findActiveByHash(tokenHash);

  if (!apiToken) {
    return null;
  }

  await ApiTokenRepo.mutate.updateLastUsed(apiToken.id);

  return {
    ...apiToken,
    resources: normalizeResources(apiToken.resources),
  };
};

const scopesAllow = (
  resourceScopes: ApiTokenScope[],
  required: ApiTokenScope,
) => {
  return (
    resourceScopes.includes(required) ||
    (required === 'read' && resourceScopes.includes('write'))
  );
};

export const tokenHasProjectScope = (
  token: ResolvedApiToken,
  projectId: string,
  scope: ApiTokenScope,
) => {
  return token.resources.some(
    (resource) =>
      resource.project_id === projectId && scopesAllow(resource.scopes, scope),
  );
};

export const tokenHasBranchScope = (
  token: ResolvedApiToken,
  projectId: string,
  branchId: string,
  scope: ApiTokenScope,
) => {
  return token.resources.some((resource) => {
    if (resource.project_id !== projectId) {
      return false;
    }

    if (!scopesAllow(resource.scopes, scope)) {
      return false;
    }

    // Project-scoped resources (branch_id === null) allow all branches
    if (resource.branch_id === null) {
      return true;
    }

    return resource.branch_id === branchId;
  });
};

export const getProjectIdsForScope = (
  token: ResolvedApiToken,
  scope: ApiTokenScope,
) => {
  const projectIds = token.resources
    .filter((resource) => scopesAllow(resource.scopes, scope))
    .map((resource) => resource.project_id);

  return Array.from(new Set(projectIds));
};

export const getAccessibleBranchIdsForProject = (
  token: ResolvedApiToken,
  projectId: string,
  scope: ApiTokenScope,
): string[] | null => {
  const resources = token.resources.filter(
    (resource) =>
      resource.project_id === projectId && scopesAllow(resource.scopes, scope),
  );

  if (resources.some((resource) => resource.branch_id === null)) {
    return null; // null means all branches are accessible
  }

  return Array.from(
    new Set(
      resources
        .map((resource) => resource.branch_id)
        .filter((branchId): branchId is string => !!branchId),
    ),
  );
};

export const extractBearerToken = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};
