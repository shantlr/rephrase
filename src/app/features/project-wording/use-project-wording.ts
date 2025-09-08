import {
  serverGetProjectWordingsBranch,
  serverUpdateProjectWordingsBranch,
} from '@/server-functions/project-wording';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ObjectSchema } from './ui-schema-editor';

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
    mutationFn: (input: { branchId: string; schema: ObjectSchema }) =>
      serverUpdateProjectWordingsBranch({ data: input }),
    onSuccess: (data) => {
      // Invalidate and refetch the specific branch
      queryClient.invalidateQueries({
        queryKey: ['project-wording-branch', data.id],
      });
    },
  });
};
