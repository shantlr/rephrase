import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/app/common/ui/button';
import { useProject } from '@/app/features/projects/use-projects';
import { useProjectWordingsBranch } from '@/app/features/wording-studio/use-project-wording';
import { WordingStudioV2 } from '@/app/features/wording-studio-v2';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/branch/$branchId/studio-v2',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId, branchId } = Route.useParams();
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const {
    data: branch,
    isLoading: branchLoading,
    error: branchError,
  } = useProjectWordingsBranch(branchId);

  const isLoading = projectLoading || branchLoading;

  if (project && !project.permissions?.can_edit_schema) {
    router.navigate({
      to: '/projects/$projectId',
      params: { projectId },
    });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading wording studio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {branchError.message}</p>
            <Button asChild className="mt-4">
              <Link to="/projects/$projectId" params={{ projectId }}>
                Back to project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Branch not found.</p>
          </div>
        </div>
      </div>
    );
  }

  if (branch.locked) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 space-y-3">
            <p className="text-yellow-600">
              This branch is locked and cannot be edited.
            </p>
            <Button asChild>
              <Link to="/projects/$projectId" params={{ projectId }}>
                Back to project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WordingStudioV2
      branch={branch}
      projectName={project?.name}
      projectId={projectId}
    />
  );
}
