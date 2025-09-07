import { useCurrentUser } from '@/app/features/user/use-me';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useCurrentUser();
  const nav = useNavigate();

  console.log({
    data,
    isPending,
  });

  useEffect(() => {
    if (!data && !isPending) {
      nav({
        to: '/login',
      });
    }
  }, [data, isPending, nav]);

  if (isPending) {
    return null;
  }

  return <Outlet />;
}
