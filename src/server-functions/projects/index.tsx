import { ProjectRepo } from '@/server/data/repo/project';
import { createServerFn } from '@tanstack/react-start';
import { $serverAuthenticated } from '../_middlewares/auth';

export type CreateProjectInput = {
  name: string;
  description: string;
  locales: string[];
};

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
  .validator((data: CreateProjectInput) => {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Project name is required');
    }
    if (typeof data.description !== 'string') {
      throw new Error('Description must be a string');
    }
    if (!Array.isArray(data.locales) || data.locales.length === 0) {
      throw new Error('At least one locale is required');
    }
    return data;
  })
  .handler(async ({ data }) => {
    // Create the project
    const project = await ProjectRepo.mutate.create({
      name: data.name.trim(),
      description: data.description.trim(),
    });

    // TODO: Store locale configuration when we implement project settings
    // For now, we'll just validate that locales are provided

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.created_at,
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
