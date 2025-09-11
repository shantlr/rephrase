import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Button } from '@/app/common/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useProject } from '@/app/features/projects/use-projects';
import {
  useProjectWordingsBranch,
  useUpdateProjectWordingsBranch,
} from '@/app/features/project-wording/use-project-wording';
import { toast } from 'sonner';
import { SchemaEditor } from '@/app/features/project-wording/ui-schema-editor';
import { EnumsEditor } from '@/app/features/project-wording/ui-enums-editor';
import { useProjectWordingForm } from '@/app/features/project-wording/use-project-wording-form';
import { SaveIcon } from 'lucide-react';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/branch/$branchId/config/edit',
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

  const updateBranch = useUpdateProjectWordingsBranch();

  const { form } = useProjectWordingForm({
    initialConfig: branch
      ? { enums: branch.enums, schema: branch.schema }
      : undefined,
    onSubmit: async (config) => {
      try {
        await updateBranch.mutateAsync({
          branchId,
          config,
        });

        toast.success('Configuration updated successfully!', {
          description: 'The project configuration has been saved.',
        });

        // Navigate back to project detail page
        router.navigate({
          to: '/projects/$projectId',
          params: { projectId },
        });
      } catch (error) {
        console.error('Failed to update configuration:', error);

        toast.error('Failed to update configuration', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred. Please try again.',
        });
      }
    },
  });

  const isLoading = projectLoading || branchLoading;

  // Authorization check - redirect if user cannot edit schema
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
            <p className="text-muted-foreground">Loading schema editor...</p>
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
            <p className="text-red-600">
              Error loading branch: {branchError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !branch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Project or branch not found</p>
          </div>
        </div>
      </div>
    );
  }

  if (branch.locked) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-yellow-600">
              This branch is locked and cannot be edited.
            </p>
            <Button asChild className="mt-4">
              <Link to="/projects/$projectId" params={{ projectId }}>
                Back to Project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="pl-0">
            <Link to="/projects/$projectId" params={{ projectId }}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Project
            </Link>
          </Button>
        </div>

        <form.AppForm>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Edit Configuration</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {project.name} • {branch.name} branch
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Enums Section */}
              <EnumsEditor form={form} />

              {/* Schema Section */}
              <SchemaEditor form={form} />

              {/* Save button */}
              <div className="flex justify-end pt-6 border-t">
                <form.FormSubmitButton>
                  {updateBranch.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </form.FormSubmitButton>
              </div>
            </CardContent>
          </Card>
        </form.AppForm>
      </div>
    </div>
  );
}
