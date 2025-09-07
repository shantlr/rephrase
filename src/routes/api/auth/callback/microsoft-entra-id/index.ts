import { ENTRA_ID } from '@/common/auth';
import {
  SESSION_COOKIE_DOMAIN,
  SESSION_COOKIE_SAME_SITE,
  SESSION_COOKIE_SECURE,
  SESSION_COOKIE_NAME,
} from '@/common/env';
import { UserRepo } from '@/data/repo/user';
import { $serverGetAuthSession } from '@/server-functions/auth';
import { createServerFileRoute, setCookie } from '@tanstack/react-start/server';
import * as z from 'zod';

const validateClaim = z.object({
  email: z.email(),
  sub: z.string().min(1),
  name: z.string().nullish(),
});

export const ServerRoute = createServerFileRoute(
  '/api/auth/callback/microsoft-entra-id/',
).methods({
  GET: async ({ request }) => {
    const u = new URL(request.url);
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state');

    if (!state || !code) {
      console.warn('Missing state or code');
      return new Response('invalid_state', { status: 400 });
    }

    const sessionState = await $serverGetAuthSession(state);
    if (typeof sessionState?.codeVerifier !== 'string') {
      console.warn('Invalid or expired state');
      return new Response('invalid_state', { status: 400 });
    }

    const { accessToken, claim, accessTokenExpiresAt, refreshToken } =
      await ENTRA_ID.validateAuthResponse(code, sessionState.codeVerifier);

    const { email, sub: providerUserId, name } = validateClaim.parse(claim);

    const { userId, accountId } = await UserRepo.mutate.ensureAccountCreated({
      email,
      name,
      provider: 'microsoft-entra-id',
      providerAccountId: providerUserId,
    });

    const session = await UserRepo.mutate.createSession({
      userId,
      accountId,
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
    });

    // Set the session cookie
    setCookie(SESSION_COOKIE_NAME, session.id, {
      expires: session.expires_at,
      httpOnly: true,
      secure: SESSION_COOKIE_SECURE,
      sameSite: SESSION_COOKIE_SAME_SITE,
      domain: SESSION_COOKIE_DOMAIN,
    });

    // Redirect to the home page after successful authentication
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });

    return response;
  },
});
