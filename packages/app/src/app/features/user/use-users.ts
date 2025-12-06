import { serverGetUsers } from '@/server-functions/users';
import { useQuery } from '@tanstack/react-query';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => serverGetUsers(),
    retry(failureCount, error) {
      if (
        typeof error === 'string' &&
        (error === 'unauthenticated' || error === 'unauthorized')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
