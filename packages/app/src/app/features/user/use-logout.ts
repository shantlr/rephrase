import { serverLogout } from '@/server-functions/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => serverLogout(),
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      navigate({
        to: '/login',
      });
    },
  });
};
