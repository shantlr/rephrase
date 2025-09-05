import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware({ type: 'function' })
  .client(() => {
    return {};
  })
  .server(async ({ method, data, response, next }) => {
    return next({
      context: {
        user: null,
      },
    });
    //
  });
