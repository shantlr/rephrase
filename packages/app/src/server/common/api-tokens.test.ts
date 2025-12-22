import {
  getAccessibleBranchIdsForProject,
  getProjectIdsForScope,
  tokenHasBranchScope,
  tokenHasProjectScope,
  type ResolvedApiToken,
} from './api-tokens';

describe('api token helpers', () => {
  const baseToken: ResolvedApiToken = {
    id: 'token-id',
    token_hash: 'hash',
    name: 'token',
    resources: [
      {
        project_id: 'project-a',
        branch_id: null,
        scopes: ['read'],
      },
      {
        project_id: 'project-b',
        branch_id: 'branch-1',
        scopes: ['write'],
      },
      {
        project_id: 'project-b',
        branch_id: 'branch-2',
        scopes: ['read'],
      },
    ],
    created_by_user_id: 'user-1',
    last_used_at: null,
    expires_at: new Date('2030-01-01T00:00:00Z'),
    revoked_at: null,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  };

  it('allows project access when any resource matches project and scope', () => {
    expect(tokenHasProjectScope(baseToken, 'project-a', 'read')).toBe(true);
    expect(tokenHasProjectScope(baseToken, 'project-b', 'read')).toBe(true);
    expect(tokenHasProjectScope(baseToken, 'project-b', 'write')).toBe(true);
    expect(tokenHasProjectScope(baseToken, 'project-c', 'read')).toBe(false);
  });

  it('allows branch access when project resource is project-scoped', () => {
    expect(
      tokenHasBranchScope(baseToken, 'project-a', 'any-branch', 'read'),
    ).toBe(true);
  });

  it('allows branch access when branch matches resource or project scope is broader', () => {
    expect(
      tokenHasBranchScope(baseToken, 'project-b', 'branch-1', 'read'),
    ).toBe(true);
    expect(
      tokenHasBranchScope(baseToken, 'project-b', 'branch-2', 'read'),
    ).toBe(true);
    expect(
      tokenHasBranchScope(baseToken, 'project-b', 'branch-3', 'read'),
    ).toBe(false);
  });

  it('derives project ids for a given scope and de-duplicates them', () => {
    expect(getProjectIdsForScope(baseToken, 'read').sort()).toEqual([
      'project-a',
      'project-b',
    ]);
    expect(getProjectIdsForScope(baseToken, 'write')).toEqual(['project-b']);
  });

  it('returns null for branch ids when project access is broad, otherwise filters', () => {
    expect(
      getAccessibleBranchIdsForProject(baseToken, 'project-a', 'read'),
    ).toBe(null);
    expect(
      getAccessibleBranchIdsForProject(baseToken, 'project-b', 'read')?.sort(),
    ).toEqual(['branch-1', 'branch-2']);
    expect(
      getAccessibleBranchIdsForProject(baseToken, 'project-b', 'write'),
    ).toEqual(['branch-1']);
    expect(
      getAccessibleBranchIdsForProject(baseToken, 'project-c', 'read'),
    ).toEqual([]);
  });
});
