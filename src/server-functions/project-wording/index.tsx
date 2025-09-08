import { ProjectWordingRepo } from '@/server/data/repo/project-wording';
import { createServerFn, json } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';
import * as z from 'zod';
import {
  isUserAllowedToReadProject,
  isUserAllowedToEditProjectSchema,
} from '@/server/common/authorization';
import { db } from '@/server/data';

const getProjectWordingsBranchValidator = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
});

const updateProjectWordingsBranchValidator = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  schema: z.object({
    type: z.literal('object'),
    description: z.string().default(''),
    fields: z.array(z.any()),
  }),
});

export const serverGetProjectWordingsBranch = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .validator(getProjectWordingsBranchValidator)
  .handler(async ({ data, context }) => {
    // Get the branch first to check project ownership and authorization
    const branch = await db
      .selectFrom('project_wording_branch')
      .select(['id', 'project_id', 'name', 'data', 'locked'])
      .where('id', '=', data.branchId)
      .where('archived_at', 'is', null)
      .executeTakeFirst();

    if (!branch) {
      throw json('Branch not found', { status: 404 });
    }

    // Check if user has read access to the project
    if (!isUserAllowedToReadProject(context.user, branch.project_id)) {
      throw json('unauthorized', { status: 403 });
    }

    // Parse the wording data
    let wordingData;
    try {
      wordingData =
        typeof branch.data === 'string' ? JSON.parse(branch.data) : branch.data;
    } catch {
      throw json('Invalid branch data', { status: 500 });
    }

    return {
      id: branch.id,
      projectId: branch.project_id,
      name: branch.name,
      locked: branch.locked,
      schema: wordingData.config.schema,
      enums: wordingData.config.enums,
    };
  });

export const serverUpdateProjectWordingsBranch = createServerFn({
  method: 'POST',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .validator(updateProjectWordingsBranchValidator)
  .handler(async ({ data, context }) => {
    // Get the branch first to check project ownership and authorization
    const branch = await db
      .selectFrom('project_wording_branch')
      .select(['id', 'project_id', 'name', 'data', 'locked'])
      .where('id', '=', data.branchId)
      .where('archived_at', 'is', null)
      .executeTakeFirst();

    if (!branch) {
      throw json('Branch not found', { status: 404 });
    }

    // Check if user has schema edit permission for the project
    if (!isUserAllowedToEditProjectSchema(context.user, branch.project_id)) {
      throw json('unauthorized', { status: 403 });
    }

    // Check if branch is locked
    if (branch.locked) {
      throw json('Branch is locked and cannot be modified', { status: 400 });
    }

    // Parse current wording data
    let currentWordingData;
    try {
      currentWordingData =
        typeof branch.data === 'string' ? JSON.parse(branch.data) : branch.data;
    } catch {
      throw json('Invalid current branch data', { status: 500 });
    }

    // Update the schema while preserving locales data
    const updatedWordingData = {
      ...currentWordingData,
      config: {
        ...currentWordingData.config,
        schema: data.schema,
      },
    };

    // Update the branch using the repository
    await ProjectWordingRepo.mutate.updateBranch({
      branchId: data.branchId,
      data: updatedWordingData,
    });

    return {
      id: branch.id,
      projectId: branch.project_id,
      name: branch.name,
      locked: branch.locked,
      schema: updatedWordingData.config.schema,
      enums: updatedWordingData.config.enums,
    };
  });
