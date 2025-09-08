import { User } from '@/server/data/user.types';

type UserWithRoles = {
  globalRoles: User['global_roles'];
  projectRoles: User['project_roles'];
};

export const isUserAllowedToCreateProject = (user: UserWithRoles) => {
  return !!user?.globalRoles?.includes('admin');
};

export const isUserAllowedToReadProject = (
  user: UserWithRoles,
  projectId: string,
) => {
  return (
    !!user?.globalRoles?.includes('admin') ||
    !!user?.projectRoles?.some(
      (pr) => pr.project_id === projectId && pr.roles.includes('reader'),
    )
  );
};

export const isUserAllowedToDeleteProject = (
  user: UserWithRoles,
  projectId: string,
) => {
  return (
    !!user?.globalRoles?.includes('admin') ||
    !!user?.projectRoles?.some(
      (pr) => pr.project_id === projectId && pr.roles.includes('admin'),
    )
  );
};

/**
 * Get the project IDs that a user is allowed to access.
 * Returns null if user is global admin (can access all projects).
 * Returns array of project IDs if user has specific project roles.
 * Returns empty array if user has no project access.
 */
export const isUserAllowedToManageUsers = (user: UserWithRoles) => {
  return !!user?.globalRoles?.includes('admin');
};

export const getAllowedProjectIds = (user: UserWithRoles): string[] | null => {
  // Global admin can access all projects
  if (user?.globalRoles?.includes('admin')) {
    return null; // null means no filter - access to all projects
  }

  // Extract project IDs from project roles
  const allowedProjectIds =
    user?.projectRoles?.map((pr) => pr.project_id) || [];

  return allowedProjectIds;
};
