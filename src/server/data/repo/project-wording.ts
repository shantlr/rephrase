import { db } from '..';
import { ProjectWordingBranch } from '../db';

const hashBranchData = (data: ProjectWordingBranch['data']): string => {
  //
};

export const ProjectWordingRepo = {
  query: {},
  mutate: {
    createBranch: async ({
      projectId,
      branchName,
      data,
    }: {
      projectId: string;
      branchName: string;
      data: ProjectWordingBranch['data'];
    }) => {
      return await db
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
  },
};
