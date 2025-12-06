import { serverListProjectBranches } from '@/server-functions/project-wording';
import { useQuery } from '@tanstack/react-query';

export const useProjectBranches = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-branches', projectId],
    queryFn: async () => {
      return await serverListProjectBranches({
        data: { projectId: projectId! },
      });
    },
    enabled: !!projectId,
  });
};
