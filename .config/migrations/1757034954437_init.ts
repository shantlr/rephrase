/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Create project table
  await db.schema
    .createTable('project')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .addColumn('archived_at', 'timestamp')
    .execute();

  // Create project_wording_branch table
  await db.schema
    .createTable('project_wording_branch')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) =>
      col.notNull().references('project.id'),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('locked', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('hash', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .addColumn('archived_at', 'timestamp')
    .execute();

  // Create project_wording_branch_operation table
  await db.schema
    .createTable('project_wording_branch_operation')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) =>
      col.notNull().references('project.id'),
    )
    .addColumn('source_branch_id', 'varchar', (col) =>
      col.notNull().references('project_wording_branch.id'),
    );
  await db.schema
    .createTable('project_wording_branch_operation')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) =>
      col.notNull().references('project.id'),
    )
    .addColumn('source_branch_id', 'varchar', (col) =>
      col.notNull().references('project_wording_branch.id'),
    )
    .addColumn('target_branch_id', 'varchar', (col) =>
      col.notNull().references('project_wording_branch.id'),
    )
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .execute();

  // Create project_wording_audit_log table
  await db.schema
    .createTable('project_wording_audit_log')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'varchar', (col) =>
      col.notNull().references('project.id'),
    )
    .addColumn('branch_id', 'varchar', (col) =>
      col.notNull().references('project_wording_branch.id'),
    )
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now')),
    )
    .execute();

  // Create user table
  await db.schema
    .createTable('user')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('global_roles', 'jsonb', (col) => col.notNull())
    .addColumn('project_roles', 'jsonb', (col) => col.notNull())
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('project_wording_audit_log').execute();
  await db.schema.dropTable('project_wording_branch_operation').execute();
  await db.schema.dropTable('project_wording_branch').execute();
  await db.schema.dropTable('project').execute();
}
