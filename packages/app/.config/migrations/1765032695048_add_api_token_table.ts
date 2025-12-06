/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('api_token')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('token_hash', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('resources', 'jsonb', (col) => col.notNull())
    .addColumn('created_by_user_id', 'varchar', (col) =>
      col.references('user.id').onDelete('cascade').notNull(),
    )
    .addColumn('last_used_at', 'timestamptz')
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('revoked_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('api_token_token_hash_idx')
    .on('api_token')
    .column('token_hash')
    .execute();

  await db.schema
    .createIndex('api_token_created_by_user_id_name_uniq')
    .unique()
    .on('api_token')
    .columns(['created_by_user_id', 'name'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('api_token_created_by_user_id_name_uniq').execute();
  await db.schema.dropIndex('api_token_token_hash_idx').execute();
  await db.schema.dropTable('api_token').execute();
}
