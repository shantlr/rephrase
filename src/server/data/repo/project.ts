import { Selectable, Transaction } from 'kysely';
import { db } from '..';
import { Database, Project } from '../db';

export type ProjectCreate = {
  name: string;
  description: string;
};

export type ProjectSelect = Selectable<Project>;

export const ProjectRepo = {
  query: {
    findById: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<ProjectSelect | undefined> => {
      const executor = trx || db;
      return await executor
        .selectFrom('project')
        .selectAll()
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .executeTakeFirst();
    },

    findAll: async (trx?: Transaction<Database>): Promise<ProjectSelect[]> => {
      const executor = trx || db;
      return await executor
        .selectFrom('project')
        .selectAll()
        .where('archived_at', 'is', null)
        .orderBy('created_at', 'desc')
        .execute();
    },

    findByUserId: async (
      _userId: string,
      trx?: Transaction<Database>,
    ): Promise<ProjectSelect[]> => {
      // TODO: Add user-project relationship when implemented
      // For now, return all projects
      const executor = trx || db;
      return await executor
        .selectFrom('project')
        .selectAll()
        .where('archived_at', 'is', null)
        .orderBy('created_at', 'desc')
        .execute();
    },
  },

  mutate: {
    create: async (
      data: ProjectCreate,
      trx?: Transaction<Database>,
    ): Promise<ProjectSelect> => {
      const executor = trx || db;
      const project = await executor
        .insertInto('project')
        .values({
          name: data.name,
          description: data.description,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return project;
    },

    update: async (
      id: string,
      data: Partial<ProjectCreate>,
      trx?: Transaction<Database>,
    ): Promise<ProjectSelect | undefined> => {
      const executor = trx || db;
      const updatedProject = await executor
        .updateTable('project')
        .set(data)
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .returningAll()
        .executeTakeFirst();

      return updatedProject;
    },

    archive: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<boolean> => {
      const executor = trx || db;
      const result = await executor
        .updateTable('project')
        .set({
          archived_at: new Date(),
        })
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .executeTakeFirst();

      return result.numUpdatedRows > 0;
    },

    delete: async (
      id: string,
      trx?: Transaction<Database>,
    ): Promise<boolean> => {
      const executor = trx || db;
      const result = await executor
        .deleteFrom('project')
        .where('id', '=', id)
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    },
  },
};
