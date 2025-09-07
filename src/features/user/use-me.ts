import { serverGetUserMe } from '@/server-functions/auth';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => serverGetUserMe(),
  });
};
