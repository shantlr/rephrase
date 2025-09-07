import { db } from '..';
import { Account, User } from '../user.types';
import { SESSION_EXPIRATION_DAYS } from '../../common/env';
import { encryptToken } from '../../common/crypto/token-encryption';

export const UserRepo = {
  query: {
    getSessionWithUserAndAccount: async (sessionId: string) => {
      return await db
        .selectFrom('user_session')
        .innerJoin('user', 'user.id', 'user_session.user_id')
        .innerJoin('account', 'account.id', 'user_session.account_id')
        .select([
          'user_session.id as session_id',
          'user_session.user_id',
          'user_session.account_id',
          'user_session.expires_at',
          'user_session.access_token',
          'user_session.refresh_token',
          'user_session.access_token_expires_at',
          'user_session.refresh_token_expires_at',
          'user_session.last_activity_at',
          'user.id as user_id',
          'user.email',
          'user.name',
          'user.global_roles',
          'user.project_roles',
          'account.provider',
          'account.provider_account_id',
        ])
        .where('user_session.id', '=', sessionId)
        .executeTakeFirst();
    },
  },
  mutate: {
    ensureAccountCreated: async ({
      email,
      name,
      provider,
      providerAccountId,
    }: {
      email: string;
      name?: string | null;
      provider: Account['provider'];
      providerAccountId: Account['provider_account_id'];
    }) => {
      return await db.transaction().execute(async (trx) => {
        const existingAccount = await trx
          .selectFrom('account')
          .select(['id', 'user_id'])
          .where(({ and, eb }) =>
            and([
              eb('provider', '=', provider),
              eb('provider_account_id', '=', providerAccountId),
            ]),
          )
          .limit(1)
          .executeTakeFirst();

        if (!existingAccount) {
          const existingUser = await trx
            .selectFrom('user')
            .where('email', '=', email)
            .select('id')
            .limit(1)
            .executeTakeFirst();

          let userId = existingUser?.id;
          if (!existingUser) {
            const nbAccounts = await trx
              .selectFrom('account')
              .select((eb) => [eb.fn.countAll().as('count')])
              .executeTakeFirstOrThrow();

            const result = await trx
              .insertInto('user')
              .values({
                email,
                name,
                global_roles: JSON.stringify(
                  // NOTE: the first user is automatically created as an admin
                  (nbAccounts.count === 0
                    ? ['admin']
                    : ['default']) satisfies User['global_roles'],
                ),
                project_roles: JSON.stringify(
                  [] satisfies User['project_roles'],
                ),
              })
              .returning('id')
              .executeTakeFirstOrThrow();
            userId = result.id;
          }

          if (!userId) {
            throw new Error('Failed to get or create user');
          }

          const createdAccount = await trx
            .insertInto('account')
            .values({
              provider,
              provider_account_id: providerAccountId,
              user_id: userId!,
            })
            .returning(['id', 'user_id'])
            .executeTakeFirst();

          if (!createdAccount) {
            throw new Error('Failed to create account');
          }

          return {
            userId,
            accountId: createdAccount.id,
          };
        } else {
          return {
            userId: existingAccount.user_id,
            accountId: existingAccount.id,
          };
        }
      });
    },
    createSession: async ({
      userId,
      accountId,
      refreshToken,
      accessToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    }: {
      userId: string;
      accountId: string;
      refreshToken?: string | null;
      accessToken?: string | null;
      accessTokenExpiresAt?: Date | null;
      refreshTokenExpiresAt?: Date | null;
    }) => {
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
      );

      // Encrypt tokens if they exist
      const encryptedRefreshToken = refreshToken
        ? await encryptToken(refreshToken)
        : null;
      const encryptedAccessToken = accessToken
        ? await encryptToken(accessToken)
        : null;

      const result = await db
        .insertInto('user_session')
        .values({
          user_id: userId,
          account_id: accountId,
          expires_at: expiresAt,
          last_activity_at: now,
          refresh_token: encryptedRefreshToken,
          access_token: encryptedAccessToken,
          access_token_expires_at: accessTokenExpiresAt ?? null,
          refresh_token_expires_at: refreshTokenExpiresAt ?? null,
        })
        .returning([
          'id',
          'user_id',
          'account_id',
          'expires_at',
          'last_activity_at',
        ])
        .executeTakeFirstOrThrow();

      return result;
    },
    updateSessionTokens: async ({
      sessionId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    }: {
      sessionId: string;
      accessToken?: string | null;
      refreshToken?: string | null;
      accessTokenExpiresAt?: Date | null;
    }) => {
      const now = new Date();

      // Encrypt tokens if they exist
      const encryptedAccessToken = accessToken
        ? await encryptToken(accessToken)
        : null;
      const encryptedRefreshToken = refreshToken
        ? await encryptToken(refreshToken)
        : null;

      return await db
        .updateTable('user_session')
        .set({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          access_token_expires_at: accessTokenExpiresAt ?? null,
          last_activity_at: now,
        })
        .where('id', '=', sessionId)
        .execute();
    },
    updateSessionActivity: async (sessionId: string) => {
      const now = new Date();
      return await db
        .updateTable('user_session')
        .set({ last_activity_at: now })
        .where('id', '=', sessionId)
        .execute();
    },
    // deleteSession: async (sessionId: string) => {
    //   return await db
    //     .deleteFrom('user_session')
    //     .where('id', '=', sessionId)
    //     .execute();
    // },
  },
};
