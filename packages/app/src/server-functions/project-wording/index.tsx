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
import { keyBy, mapValues } from 'lodash-es';

const constantNameValidator = z.string().regex(/^[A-Z0-9_]+$/);

export const serverGetProjectWordingsBranch = createServerFn()
  .middleware([$serverAuthenticated()])
  .inputValidator(
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
      localeValues: mapValues(
        keyBy(branch.data.locales, (l) => l.tag),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l) => (l.values ?? {}) as Record<string, any>,
      ),
    };
  });

export const serverListProjectBranches = createServerFn()
  .middleware([$serverAuthenticated()])
  .inputValidator(
    z.object({
      projectId: z.string().min(1, 'Project ID is required'),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!isUserAllowedToReadProject(context.user, data.projectId)) {
      throw json('unauthorized', { status: 403 });
    }

    const branches = await db
      .selectFrom('project_wording_branch')
      .select(['id', 'name', 'locked', 'archived_at'])
      .where('project_id', '=', data.projectId)
      .where('archived_at', 'is', null)
      .orderBy('created_at', 'asc')
      .execute();

    return {
      branches: branches.map((b) => ({
        id: b.id,
        name: b.name,
        locked: b.locked,
        isDefault: b.name === 'main',
      })),
    };
  });

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
    schema: z
      .object({
        type: z.literal('object'),
      })
      .loose(),
    locales: z
      .array(
        z.object({
          tag: z.string(),
          values: z.record(z.string(), z.any()).optional(),
        }),
      )
      .optional(),
  }),
});

export const serverUpdateProjectWordingsBranch = createServerFn({
  method: 'POST',
})
  .middleware([$serverAuthenticated()])
  .inputValidator(updateProjectWordingsBranchValidator)
  .handler(async ({ data, context }) => {
    // Get the branch first to check project ownership and authorization
    const branch = await db
      .selectFrom('project_wording_branch')
      .select(['id', 'project_id', 'name', 'data', 'locked'])
      .where('id', '=', data.branchId)
      .where('archived_at', 'is', null)
      .executeTakeFirst();

    // console.log({
    //   data,
    // });
    // throw new Error('Debug stop');

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
      locales: data.config.locales ?? currentWordingData.locales,
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
      schema: updatedWordingData.schema,
      constants: updatedWordingData.constants,
      locales: updatedWordingData.locales?.map((l) => l.tag) || [],
      localeValues: mapValues(
        keyBy(branch.data.locales, (l) => l.tag),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l) => (l.values ?? {}) as Record<string, any>,
      ),
    };
  });
