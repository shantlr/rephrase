import { Selectable } from 'kysely';
import { db } from '..';
import { Project } from '../db';

export type ProjectCreate = {
  name: string;
  description: string;
};

export type ProjectSelect = Selectable<Project>;

export const ProjectRepo = {
  query: {
    findById: async (id: string): Promise<ProjectSelect | undefined> => {
      return await db
        .selectFrom('project')
        .selectAll()
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .executeTakeFirst();
    },

    findAll: async (): Promise<ProjectSelect[]> => {
      return await db
        .selectFrom('project')
        .selectAll()
        .where('archived_at', 'is', null)
        .orderBy('created_at', 'desc')
        .execute();
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findByUserId: async (_userId: string): Promise<ProjectSelect[]> => {
      // TODO: Add user-project relationship when implemented
      // For now, return all projects
      return await db
        .selectFrom('project')
        .selectAll()
        .where('archived_at', 'is', null)
        .orderBy('created_at', 'desc')
        .execute();
    },
  },

  mutate: {
    create: async (data: ProjectCreate): Promise<ProjectSelect> => {
      const project = await db
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
    ): Promise<ProjectSelect | undefined> => {
      const updatedProject = await db
        .updateTable('project')
        .set(data)
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .returningAll()
        .executeTakeFirst();

      return updatedProject;
    },

    archive: async (id: string): Promise<boolean> => {
      const result = await db
        .updateTable('project')
        .set({
          archived_at: new Date(),
        })
        .where('id', '=', id)
        .where('archived_at', 'is', null)
        .executeTakeFirst();

      return result.numUpdatedRows > 0;
    },

    delete: async (id: string): Promise<boolean> => {
      const result = await db
        .deleteFrom('project')
        .where('id', '=', id)
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    },
  },
};
