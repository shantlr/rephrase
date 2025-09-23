import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/app/common/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useProject } from '@/app/features/projects/use-projects';
import { ImportForm } from '@/app/features/import-wording/ui-import-form';
import { useImportSchema } from '@/app/features/project-wording/use-project-wording';
import { toast } from 'sonner';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/import',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectId);
  const importSchema = useImportSchema();

  const handleImport = async (data: { schema: any; localeTag: string }) => {
    try {
      await importSchema.mutateAsync({
        projectId,
        schema: data.schema,
      });

      toast.success('Schema imported successfully!', {
        description: `Wording schema has been created for locale "${data.localeTag}".`,
      });

      // Navigate back to project page
      router.navigate({
        to: '/projects/$projectId',
        params: { projectId },
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import schema', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">
              Error loading project: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Project not found</p>
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
            <Link
              to="/projects/$projectId"
              params={{
                projectId: project.id,
              }}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Project
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              Import Wording Schema for &ldquo;{project.name}&rdquo;
            </h1>
            <p className="text-muted-foreground mt-2">
              Import your existing JSON or TypeScript translation files to
              automatically generate a wording schema.
            </p>
          </div>

          <ImportForm
            onImport={handleImport}
            isLoading={importSchema.isPending}
          />
        </div>
      </div>
    </div>
  );
}
