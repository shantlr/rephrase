import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { useProject } from '@/app/features/projects/use-projects';
import { Badge } from '@/app/common/ui/badge';
import { Button } from '@/app/common/ui/button';
import { ArrowLeftIcon, CalendarIcon, LanguagesIcon } from 'lucide-react';
import { LOCALE_OPTIONS } from '@/app/common/data/locales';

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { data: project, isLoading, error } = useProject(projectId);

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
            <CardTitle className="text-2xl">{project.name}</CardTitle>
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
