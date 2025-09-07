import {
  serverCreateProject,
  serverGetProjects,
  serverGetProject,
  CreateProjectInput,
} from '@/server-functions/projects';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => serverGetProjects(),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => serverGetProject({ data: { id } }),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      serverCreateProject({ data: input }),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
