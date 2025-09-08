import { isUserAllowedToManageUsers } from '@/server/common/authorization';
import { UserRepo } from '@/server/data/repo/user';
import { createServerFn, json } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';

export const serverGetUsers = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .handler(async ({ context }) => {
    if (
      !isUserAllowedToManageUsers({
        globalRoles: context.user.globalRoles,
        projectRoles: context.user.projectRoles,
      })
    ) {
      throw json('unauthorized', { status: 403 });
    }

    const users = await UserRepo.query.findAll();

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        globalRoles: user.global_roles,
        projectRoles: user.project_roles,
        createdAt: user.created_at,
      })),
    };
  });
