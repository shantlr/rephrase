import { serverGetUserMe } from '@/server-functions/auth';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => serverGetUserMe(),
    retry(failureCount, error) {
      if (typeof error === 'string' && error === 'unauthenticated') {
        return false;
      }
      return failureCount < 3;
    },
  });
};
