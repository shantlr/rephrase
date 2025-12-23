/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('project')
    .addColumn('default_branch_id', 'varchar', (col) =>
      col.references('project_wording_branch.id').onDelete('set null'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('project')
    .dropColumn('default_branch_id')
    .execute();
}
