import {
  serverCreateApiToken,
  serverListApiTokens,
  serverRevokeApiToken,
} from '@/server-functions/auth/api-tokens';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useApiTokens = () => {
  return useQuery({
    queryKey: ['api-tokens'],
    queryFn: () => serverListApiTokens(),
  });
};

export const useCreateApiToken = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      expiresAt: Date;
      resources: {
        projectId: string;
        branchId: string | null;
        scopes: ('read' | 'write')[];
      }[];
    }) =>
      serverCreateApiToken({
        data: {
          name: input.name,
          expiresAt: input.expiresAt,
          resources: input.resources,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-tokens'] }),
  });
};

export const useRevokeApiToken = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) =>
      serverRevokeApiToken({ data: { tokenId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-tokens'] }),
  });
};
