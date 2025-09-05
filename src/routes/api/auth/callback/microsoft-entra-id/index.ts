import { createServerFileRoute } from '@tanstack/react-start/server';

export const ServerRoute = createServerFileRoute(
  '/api/auth/callback/microsoft-entra-id/',
).methods({
  POST: async ({ request }) => {
    console.log('BODY:::::', await request.json());
    return new Response('Hello, World!');
  },
});
