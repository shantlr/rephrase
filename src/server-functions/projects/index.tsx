import { ProjectRepo } from '@/server/data/repo/project';
import { ProjectWordingRepo } from '@/server/data/repo/project-wording';
import { createServerFn, json } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';
import * as z from 'zod';
import { LOCALE_OPTIONS, VALID_LOCALE_TAGS } from '@/app/common/data/locales';
import { isUserAllowedToCreateProject } from '@/server/common/authorization';
import { db } from '@/server/data';

const createProjectInputValidator = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  description: z.string().default(''),
  locales: z
    .array(
      z.string().refine((locale) => VALID_LOCALE_TAGS.includes(locale), {
        message:
          'Invalid locale tag. Must be one of the supported locale tags.',
      }),
    )
    .min(1, 'At least one locale is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectInputValidator>;

export type CreateProjectOutput = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
};

export const serverCreateProject = createServerFn({
  method: 'POST',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .validator(createProjectInputValidator)
  .handler(async ({ data, context }) => {
    if (!isUserAllowedToCreateProject(context.user)) {
      throw json('unauthorized', { status: 403 });
    }

    const result = await db.transaction().execute(async (trx) => {
      // Create the project using repository
      const project = await ProjectRepo.mutate.create(
        {
          name: data.name,
          description: data.description,
        },
        trx,
      );

      // Create the main wording branch with empty data for the specified locales
      await ProjectWordingRepo.mutate.createBranch(
        {
          projectId: project.id,
          branchName: 'main',
          data: {
            config: {
              enums: {},
              schema: {
                type: 'object' as const,
                description: '',
                fields: [],
              },
            },
            locales: data.locales.map((localeTag) => {
              const l = LOCALE_OPTIONS.find((lc) => lc.tag === localeTag)!;
              return {
                code: l.code,
                tag: l.tag,
                data: [],
              };
            }),
          },
        },
        trx,
      );

      return project;
    });

    // TODO: Store locale configuration when we implement project settings
    // For now, we'll just validate that locales are provided

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      createdAt: result.created_at,
    } as CreateProjectOutput;
  });

export const serverGetProjects = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .handler(async () => {
    // For now, get all projects. Later we can filter by user access
    const projects = await ProjectRepo.query.findAll();

    return {
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      })),
    };
  });

export const serverGetProject = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([$serverAuthenticated()])
  .validator((data: { id: string }) => {
    if (!data.id || typeof data.id !== 'string') {
      throw new Error('Project ID is required');
    }
    return data;
  })
  .handler(async ({ data }) => {
    const project = await ProjectRepo.query.findById(data.id);

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  });
