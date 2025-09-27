import { ProjectWordingRepo } from '@/server/data/repo/project-wording';
import { createServerFn, json } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';
import * as z from 'zod';
import {
  isUserAllowedToReadProject,
  isUserAllowedToEditProjectSchema,
} from '@/server/common/authorization';
import { db } from '@/server/data';
import { WordingData } from '@/server/data/wording.types';

const constantNameValidator = z.string().regex(/^[A-Z0-9_]+$/);

const updateProjectWordingsBranchValidator = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  config: z.object({
    constants: z.array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('enum'),
          get name() {
            return constantNameValidator;
          },
          description: z.string().optional(),
          options: z.array(z.string()),
        }),
        z.object({
          type: z.literal('string'),
          get name() {
            return constantNameValidator;
          },
          description: z.string().optional(),
          value: z.string(),
        }),
      ]),
    ),
    schema: z.object({
      nodes: z.record(
        z.string(),
        z.looseObject({
          id: z.string(),
          type: z.string(),
        }),
      ),
      root: z.object({
        type: z.literal('object'),
        fields: z.array(
          z.looseObject({
            typeId: z.string(),
          }),
        ),
      }),
    }),
  }),
});

export const serverGetProjectWordingsBranch = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .validator(
    z.object({
      branchId: z.string().min(1, 'Branch ID is required'),
    }),
  )
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

    return {
      id: branch.id,
      projectId: branch.project_id,
      name: branch.name,
      locked: branch.locked,
      schema: branch.data.schema,
      constants: branch.data.constants,
      locales: branch.data.locales?.map((l) => l.tag) || [],
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

    // Update the config and locales data
    const updatedWordingData: WordingData = {
      ...currentWordingData,
      ...data.config,
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
      schema: branch.data.schema,
      constants: branch.data.constants,
      locales: branch.data.locales?.map((l) => l.tag) || [],
    };
  });
