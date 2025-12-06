import { Transaction } from 'kysely';
import { db } from '..';
import { Database } from '../db';
import { ApiToken, ApiTokenResource, ApiTokenTable } from '../api-token.types';

export type ApiTokenCreate = {
  name: ApiTokenTable['name'];
  tokenHash: ApiTokenTable['token_hash'];
  resources: ApiTokenResource[];
  createdByUserId: ApiTokenTable['created_by_user_id']['__insert__'];
  expiresAt?: ApiTokenTable['expires_at'];
};

export const ApiTokenRepo = {
  query: {
    findById: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<ApiToken | undefined> => {
      const executor = trx || db;
      return await executor
        .selectFrom('api_token')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
    },

    findByNameForUser: async (
      {
        name,
        userId,
      }: {
        name: string;
        userId: string;
      },
      trx?: Transaction<Database>,
    ): Promise<ApiToken | undefined> => {
      const executor = trx || db;
      return await executor
        .selectFrom('api_token')
        .selectAll()
        .where('name', '=', name)
        .where('created_by_user_id', '=', userId)
        .executeTakeFirst();
    },

    listByUser: async (
      userId: string,
      trx?: Transaction<Database>,
    ): Promise<ApiToken[]> => {
      const executor = trx || db;
      return await executor
        .selectFrom('api_token')
        .selectAll()
        .where('created_by_user_id', '=', userId)
        .orderBy('created_at', 'desc')
        .execute();
    },

    findActiveByHash: async (
      tokenHash: string,
      trx?: Transaction<Database>,
    ): Promise<ApiToken | undefined> => {
      const executor = trx || db;
      const now = new Date();
      return await executor
        .selectFrom('api_token')
        .selectAll()
        .where('token_hash', '=', tokenHash)
        .where('revoked_at', 'is', null)
        .where((eb) =>
          eb.or([eb('expires_at', 'is', null), eb('expires_at', '>', now)]),
        )
        .executeTakeFirst();
    },
  },

  mutate: {
    create: async (
      data: ApiTokenCreate,
      trx?: Transaction<Database>,
    ): Promise<ApiToken> => {
      const executor = trx || db;
      return await executor
        .insertInto('api_token')
        .values({
          token_hash: data.tokenHash,
          name: data.name,
          resources: JSON.stringify(data.resources),
          created_by_user_id: data.createdByUserId,
          expires_at: data.expiresAt ?? null,
          revoked_at: null,
          last_used_at: null,
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },

    revoke: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<boolean> => {
      const executor = trx || db;
      const result = await executor
        .updateTable('api_token')
        .set({ revoked_at: new Date(), updated_at: new Date() })
        .where('id', '=', id)
        .where('revoked_at', 'is', null)
        .executeTakeFirst();

      return result.numUpdatedRows > 0;
    },

    updateLastUsed: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<void> => {
      const executor = trx || db;
      await executor
        .updateTable('api_token')
        .set({ last_used_at: new Date(), updated_at: new Date() })
        .where('id', '=', id)
        .execute();
    },
  },
};
