import {
  serverGetProjectWordingsBranch,
  serverUpdateProjectWordingsBranch,
} from '@/server-functions/project-wording';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useProjectWordingsBranch = (branchId: string) => {
  return useQuery({
    queryKey: ['project-wording-branch', branchId],
    queryFn: () => serverGetProjectWordingsBranch({ data: { branchId } }),
    enabled: !!branchId,
  });
};

export const useUpdateProjectWordingsBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: Parameters<typeof serverUpdateProjectWordingsBranch>[0]['data'],
    ) =>
      serverUpdateProjectWordingsBranch({
        data: input,
      }),
    onSuccess: (data) => {
      // Invalidate and refetch the specific branch
      queryClient.invalidateQueries({
        queryKey: ['project-wording-branch', data.id],
      });
    },
  });
};
