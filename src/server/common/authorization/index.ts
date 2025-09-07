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
