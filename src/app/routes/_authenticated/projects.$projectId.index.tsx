import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import {
  useProject,
  useDeleteProject,
} from '@/app/features/projects/use-projects';
import { Badge } from '@/app/common/ui/badge';
import { Button } from '@/app/common/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/common/ui/alert-dialog';
import {
  ArrowLeftIcon,
  CalendarIcon,
  LanguagesIcon,
  TrashIcon,
  EditIcon,
} from 'lucide-react';
import { LOCALE_OPTIONS } from '@/app/common/data/locales';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/projects/$projectId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectId);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);

      // Show success toast
      toast.success('Project deleted successfully!', {
        description: `"${project?.name}" has been permanently deleted.`,
      });

      router.navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Failed to delete project:', error);

      // Show error toast
      toast.error('Failed to delete project', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
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
            <Link to="/dashboard">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <div className="flex gap-2">
                {project.permissions?.can_edit_schema &&
                  project.defaultBranch && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/projects/$projectId/branch/$branchId/schema/edit"
                        params={{
                          projectId: project.id,
                          branchId: project.defaultBranch.id,
                        }}
                      >
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit Schema
                      </Link>
                    </Button>
                  )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{project.name}
                        &rdquo;? This action cannot be undone and will
                        permanently remove all project data including
                        translations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteProject.isPending}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        {deleteProject.isPending
                          ? 'Deleting...'
                          : 'Delete Project'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Created</span>
                </div>
                <p className="text-sm">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Last Updated</span>
                </div>
                <p className="text-sm">
                  {new Date(project.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LanguagesIcon className="w-4 h-4" />
                <span>Supported Locales ({project.locales?.length || 0})</span>
              </div>
              {project.locales && project.locales.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.locales.map((locale) => {
                    const localeInfo = LOCALE_OPTIONS.find(
                      (l) => l.tag === locale.tag,
                    );
                    return (
                      <div
                        key={locale.tag}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs font-mono"
                            >
                              {locale.code.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">
                              {localeInfo?.name || locale.tag}
                            </span>
                          </div>
                          {localeInfo?.nativeName && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {localeInfo.nativeName}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {locale.tag}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No locales configured for this project
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
