import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/app/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { useProjects } from '@/app/features/projects/use-projects';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useProjects();
  const projects = data?.projects || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your localization projects
            </p>
          </div>
          <Button asChild>
            <Link to="/projects/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Link>
          </Button>
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">
                  Error loading projects: {error.message}
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first localization project
                </p>
                <Button asChild>
                  <Link to="/projects/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Created{' '}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          View Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
