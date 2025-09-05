/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Project table
  await db.schema
    .createTable('Project')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
    .addColumn('archivedAt', 'timestamptz')
    .execute();

  // ProjectWordingBranch table
  await db.schema
    .createTable('ProjectWordingBranch')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('projectId', 'varchar', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('locked', 'boolean', (col) => col.notNull())
    .addColumn('hash', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('archived_at', 'timestamptz')
    .addForeignKeyConstraint(
      'ProjectWordingBranch_projectId_fkey',
      ['projectId'],
      'Project',
      ['id'],
    )
    .execute();

  // ProjectWordingBranchOperation table
  await db.schema
    .createTable('ProjectWordingBranchOperation')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) => col.notNull())
    .addColumn('source_branch_id', 'varchar', (col) => col.notNull())
    .addColumn('target_branch_id', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addForeignKeyConstraint(
      'ProjectWordingBranchOperation_project_id_fkey',
      ['project_id'],
      'Project',
      ['id'],
    )
    .addForeignKeyConstraint(
      'ProjectWordingBranchOperation_source_branch_id_fkey',
      ['source_branch_id'],
      'ProjectWordingBranch',
      ['id'],
    )
    .addForeignKeyConstraint(
      'ProjectWordingBranchOperation_target_branch_id_fkey',
      ['target_branch_id'],
      'ProjectWordingBranch',
      ['id'],
    )
    .execute();

  // ProjectWordingAuditLog table
  await db.schema
    .createTable('ProjectWordingAuditLog')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) => col.notNull())
    .addColumn('branch_id', 'varchar', (col) => col.notNull())
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addForeignKeyConstraint(
      'ProjectWordingAuditLog_project_id_fkey',
      ['project_id'],
      'Project',
      ['id'],
    )
    .addForeignKeyConstraint(
      'ProjectWordingAuditLog_branch_id_fkey',
      ['branch_id'],
      'ProjectWordingBranch',
      ['id'],
    )
    .execute();

  // User table
  await db.schema
    .createTable('User')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar')
    .addColumn('email', 'varchar')
    .addColumn('emailVerified', 'timestamptz')
    .addColumn('image', 'varchar')
    .execute();

  // Account table
  await db.schema
    .createTable('Account')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('userId', 'varchar', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('provider', 'varchar', (col) => col.notNull())
    .addColumn('providerAccountId', 'varchar', (col) => col.notNull())
    .addColumn('refresh_token', 'varchar')
    .addColumn('access_token', 'varchar')
    .addColumn('expires_at', 'bigint')
    .addColumn('token_type', 'varchar')
    .addColumn('scope', 'varchar')
    .addColumn('id_token', 'varchar')
    .addColumn('session_state', 'varchar')
    .addForeignKeyConstraint('Account_userId_fkey', ['userId'], 'User', ['id'])
    .execute();

  // Session table
  await db.schema
    .createTable('Session')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('sessionToken', 'varchar', (col) => col.notNull())
    .addColumn('userId', 'varchar', (col) => col.notNull())
    .addColumn('expires', 'timestamptz', (col) => col.notNull())
    .addForeignKeyConstraint('Session_userId_fkey', ['userId'], 'User', ['id'])
    .execute();

  // VerificationToken table
  await db.schema
    .createTable('VerificationToken')
    .addColumn('identifier', 'varchar', (col) => col.notNull())
    .addColumn('token', 'varchar', (col) => col.notNull())
    .addColumn('expires', 'timestamptz', (col) => col.notNull())
    .addPrimaryKeyConstraint('VerificationToken_pkey', ['identifier', 'token'])
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('VerificationToken').execute();
  await db.schema.dropTable('Session').execute();
  await db.schema.dropTable('Account').execute();
  await db.schema.dropTable('User').execute();
  await db.schema.dropTable('ProjectWordingAuditLog').execute();
  await db.schema.dropTable('ProjectWordingBranchOperation').execute();
  await db.schema.dropTable('ProjectWordingBranch').execute();
  await db.schema.dropTable('Project').execute();
}
