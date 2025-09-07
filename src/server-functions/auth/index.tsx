import { ENTRA_ID } from '@/common/auth';
import { MICROSOFT_ENTRA_ID_SSO_SESSION_KEY_PREFIX } from '@/common/env/microsoft-entra-id';
import { redis } from '@/data/redis';
import { redirect } from '@tanstack/react-router';
import { createServerFn, serverOnly } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';

const resolveSessionKey = (state: string) =>
  `${MICROSOFT_ENTRA_ID_SSO_SESSION_KEY_PREFIX}:${state}`;

export const $serverGetAuthSession = serverOnly(async (state: string) => {
  const value = await redis.get(resolveSessionKey(state));
  return value
    ? (JSON.parse(value) as {
        codeVerifier: string;
      })
    : null;
});

export const serverAuthStartMicrosoftEntraId = createServerFn({
  method: 'GET',
  response: 'data',
}).handler(async () => {
  const { url, state, codeVerifier } = ENTRA_ID.createAuthUrl();

  await redis.set(resolveSessionKey(state), JSON.stringify({ codeVerifier }), {
    expiration: {
      type: 'EX',
      value: 300,
    },
  });

  throw redirect({
    href: url.toString(),
    statusCode: 302,
  });
});

export const serverGetUserMe = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .handler(async ({ context }) => {
    return {
      user: {
        id: context.user.id,
        email: context.user.email,
        name: context.user.name,
      },
    };
  });
