import { ENTRA_ID } from '@/common/auth';
import { decryptToken } from '@/common/crypto/token-encryption';
import {
  SESSION_COOKIE_NAME,
  SESSION_UPDATE_LAST_ACTIVITY_AT_DELAY_MINUTES,
} from '@/common/env';
import { UserRepo } from '@/data/repo/user';
import { User } from '@/data/user.types';
import { createMiddleware } from '@tanstack/react-start';
import { getCookie, setResponseStatus } from '@tanstack/react-start/server';

type Context = {
  user: {
    id: string;
    email: string;
    name: string | null;
    globalRoles: User['global_roles'];
    projectRoles: User['project_roles'];
  };
  session: {
    id: string;
    accountId: string;
    provider: string;
    providerAccountId: string;
    expiresAt: Date;
  };
};

export const $serverAuthenticated = () =>
  createMiddleware({
    type: 'function',
  }).server<Context>(async ({ next, response }) => {
    const sessionId = getCookie(SESSION_COOKIE_NAME);

    if (!sessionId) {
      setResponseStatus(401);
      return null;
    }

    const session =
      await UserRepo.query.getSessionWithUserAndAccount(sessionId);

    if (!session) {
      setResponseStatus(401);
      return null;
    }

    const now = new Date();

    if (session.expires_at < now) {
      setResponseStatus(401);
      return null;
    }

    let accessToken = session.access_token
      ? await decryptToken(session.access_token)
      : null;
    let refreshToken = session.refresh_token
      ? await decryptToken(session.refresh_token)
      : null;

    if (
      accessToken &&
      session.access_token_expires_at &&
      session.access_token_expires_at <= now
    ) {
      if (
        refreshToken &&
        session.refresh_token_expires_at &&
        session.refresh_token_expires_at > now
      ) {
        try {
          const refreshedTokens =
            await ENTRA_ID.refreshAccessToken(refreshToken);

          await UserRepo.mutate.updateSessionTokens({
            sessionId,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken,
            accessTokenExpiresAt: refreshedTokens.accessTokenExpiresAt,
          });

          accessToken = refreshedTokens.accessToken;
          refreshToken = refreshedTokens.refreshToken;
        } catch (error) {
          console.error('Failed to refresh access token:', error);
          setResponseStatus(401);
          return null;
        }
      } else {
        // await UserRepo.mutate.deleteSession(sessionId);
        console.log('Session access token expired and no valid refresh token');
        setResponseStatus(401);
        return null;
      }
    } else {
      // NOTE: we throttle session activity updates to avoid excessive writes
      if (
        session.last_activity_at <
        new Date(
          Date.now() -
            SESSION_UPDATE_LAST_ACTIVITY_AT_DELAY_MINUTES * 60 * 1000,
        )
      ) {
        await UserRepo.mutate.updateSessionActivity(sessionId);
      }
    }

    return next({
      context: {
        user: {
          id: session.user_id,
          email: session.email,
          name: session.name,
          globalRoles: session.global_roles,
          projectRoles: session.project_roles,
        },
        session: {
          id: sessionId,
          accountId: session.account_id,
          provider: session.provider,
          providerAccountId: session.provider_account_id,
          expiresAt: session.expires_at,
        },
      } as Context,
    });
  });
