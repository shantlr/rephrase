import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../features/user/use-me';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useCurrentUser();
  const nav = useNavigate();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!data?.user) {
      nav({
        to: '/login',
      });
    } else {
      nav({
        to: '/dashboard',
      });
    }
  }, [data, isPending, nav]);

  return <div>Loading...</div>;
}
