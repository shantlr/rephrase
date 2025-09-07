/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';
import { sql } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Enable pgcrypto extension for gen_random_uuid function
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);
  // project table
  await db.schema
    .createTable('project')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo('NOW()'),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo('NOW()'),
    )
    .addColumn('archived_at', 'timestamptz')
    .execute();

  // project_wording_branch table
  await db.schema
    .createTable('project_wording_branch')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('project_id', 'varchar', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('locked', 'boolean', (col) => col.notNull())
    .addColumn('hash', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo('NOW()'),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo('NOW()'),
    )
    .addColumn('archived_at', 'timestamptz')
    .addForeignKeyConstraint(
      'project_wording_branch_project_id_fkey',
      ['project_id'],
      'project',
      ['id'],
    )
    .execute();

  // project_wording_branch_operation table
  await db.schema
    .createTable('project_wording_branch_operation')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('project_id', 'varchar', (col) => col.notNull())
    .addColumn('source_branch_id', 'varchar', (col) => col.notNull())
    .addColumn('target_branch_id', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addForeignKeyConstraint(
      'project_wording_branch_operation_project_id_fkey',
      ['project_id'],
      'project',
      ['id'],
    )
    .addForeignKeyConstraint(
      'project_wording_branch_operation_source_branch_id_fkey',
      ['source_branch_id'],
      'project_wording_branch',
      ['id'],
    )
    .addForeignKeyConstraint(
      'project_wording_branch_operation_target_branch_id_fkey',
      ['target_branch_id'],
      'project_wording_branch',
      ['id'],
    )
    .execute();

  // project_wording_audit_log table
  await db.schema
    .createTable('project_wording_audit_log')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('project_id', 'varchar', (col) => col.notNull())
    .addColumn('branch_id', 'varchar', (col) => col.notNull())
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addForeignKeyConstraint(
      'project_wording_audit_log_project_id_fkey',
      ['project_id'],
      'project',
      ['id'],
    )
    .addForeignKeyConstraint(
      'project_wording_audit_log_branch_id_fkey',
      ['branch_id'],
      'project_wording_branch',
      ['id'],
    )
    .execute();

  // user table
  await db.schema
    .createTable('user')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar')
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('global_roles', 'jsonb', (col) => col.notNull().defaultTo('[]'))
    .addColumn('project_roles', 'jsonb', (col) => col.notNull().defaultTo('[]'))
    .execute();

  // account table
  await db.schema
    .createTable('account')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('provider', 'varchar', (col) => col.notNull())
    .addColumn('provider_account_id', 'varchar', (col) => col.notNull())
    .addForeignKeyConstraint('account_user_id_fkey', ['user_id'], 'user', [
      'id',
    ])
    .execute();

  // user_session table
  await db.schema
    .createTable('user_session')
    .addColumn('id', 'varchar', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('account_id', 'varchar', (col) => col.notNull())
    .addColumn('refresh_token', 'varchar')
    .addColumn('access_token', 'varchar')
    .addColumn('access_token_expires_at', 'timestamptz')
    .addColumn('refresh_token_expires_at', 'timestamptz')
    .addColumn('last_activity_at', 'timestamptz', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('disabled_at', 'timestamptz')
    .addForeignKeyConstraint('user_session_user_id_fkey', ['user_id'], 'user', [
      'id',
    ])
    .addForeignKeyConstraint(
      'user_session_account_id_fkey',
      ['account_id'],
      'account',
      ['id'],
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_session').execute();
  await db.schema.dropTable('account').execute();
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('project_wording_audit_log').execute();
  await db.schema.dropTable('project_wording_branch_operation').execute();
  await db.schema.dropTable('project_wording_branch').execute();
  await db.schema.dropTable('project').execute();
}
