import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, LanguagesIcon, LogOut, User, Users } from 'lucide-react';
import { Button } from '@/app/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Badge } from '@/app/common/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/common/ui/dropdown-menu';
import { useProjects } from '@/app/features/projects/use-projects';
import { useCurrentUser } from '@/app/features/user/use-me';
import { useLogout } from '@/app/features/user/use-logout';
import { useUsers } from '@/app/features/user/use-users';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useProjects();
  const projects = data?.projects || [];
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useUsers();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your localization projects
            </p>
          </div>

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{currentUser.user.name || currentUser.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {currentUser.user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Projects</CardTitle>
              {projects.length > 0 &&
                currentUser?.user.permissions.can_create_project && (
                  <Button asChild size="sm">
                    <Link to="/projects/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Link>
                  </Button>
                )}
            </div>
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
                  {currentUser?.user.permissions.can_create_project
                    ? 'Get started by creating your first localization project'
                    : 'No projects have been created yet'}
                </p>
                {currentUser?.user.permissions.can_create_project && (
                  <Button asChild>
                    <Link to="/projects/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to="/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        {/* Locale codes display */}
                        {project.localeCodes &&
                          project.localeCodes.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <LanguagesIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Locales ({project.localeCodes.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {project.localeCodes.slice(0, 5).map((code) => (
                                  <Badge
                                    key={code}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {code.toUpperCase()}
                                  </Badge>
                                ))}
                                {project.localeCodes.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.localeCodes.length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>
                            Created{' '}
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Management Section - Only visible to users who can manage users */}
        {currentUser?.user.permissions.can_manage_users && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">
                    Error loading users: {usersError.message}
                  </p>
                </div>
              ) : !usersData?.users || usersData.users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Total users: {usersData.users.length}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {usersData.users.map((user) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {user.name || user.email}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {user.email}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {user.globalRoles.map((role) => (
                                <Badge
                                  key={role}
                                  variant={
                                    role === 'admin' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {role}
                                </Badge>
                              ))}
                              {user.projectRoles.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.projectRoles.length} project roles
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created{' '}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
