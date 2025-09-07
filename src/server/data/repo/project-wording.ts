import objectHash from 'object-hash';
import { Transaction } from 'kysely';
import { db } from '..';
import { Database, ProjectWordingBranch } from '../db';

const hashBranchData = (data: ProjectWordingBranch['data']): string => {
  return objectHash(data, { algorithm: 'sha256', encoding: 'hex' });
};

export const ProjectWordingRepo = {
  query: {},
  mutate: {
    createBranch: async (
      {
        projectId,
        branchName,
        data,
      }: {
        projectId: string;
        branchName: string;
        data: ProjectWordingBranch['data'];
      },
      trx?: Transaction<Database>,
    ) => {
      const executor = trx || db;
      return await executor
        .insertInto('project_wording_branch')
        .values({
          name: branchName,
          project_id: projectId,
          data: JSON.stringify(data),
          hash: hashBranchData(data),
          locked: false,
          updated_at: new Date(),
        })
        .executeTakeFirstOrThrow();
    },
    updateBranch: async (
      {
        branchId,
        data,
      }: {
        branchId: string;
        data: ProjectWordingBranch['data'];
      },
      trx?: Transaction<Database>,
    ) => {
      const executor = trx || db;
      return await executor
        .updateTable('project_wording_branch')
        .set({
          data: JSON.stringify(data),
          hash: hashBranchData(data),
          updated_at: new Date(),
        })
        .where('id', '=', branchId)
        .where('locked', '=', false)
        .executeTakeFirstOrThrow();
    },
  },
};
