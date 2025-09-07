import { useCurrentUser } from '@/features/user/use-me';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useCurrentUser();

  console.log(data);

  return <div>Hello</div>;
}
