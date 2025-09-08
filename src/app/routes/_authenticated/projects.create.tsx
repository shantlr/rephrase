import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/app/common/ui/button';
import { Label } from '@/app/common/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Badge } from '@/app/common/ui/badge';
import { useCreateProject } from '@/app/features/projects/use-projects';
import { LOCALE_OPTIONS, VALID_LOCALE_TAGS } from '@/app/common/data/locales';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppForm } from '@/app/common/hooks/use-app-form';

const createProjectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  description: z.string(),
  locales: z
    .array(
      z.string().refine((locale) => VALID_LOCALE_TAGS.includes(locale), {
        message: 'Invalid locale tag',
      }),
    )
    .min(1, 'At least one locale is required'),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

export const Route = createFileRoute('/_authenticated/projects/create')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const createProjectMutation = useCreateProject();

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      locales: ['en-GB'], // Default to English
    } as CreateProjectFormData,
    validators: {
      onChange: createProjectFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createProjectMutation.mutateAsync(value);

        // Show success toast
        toast.success('Project created successfully!', {
          description: `"${value.name}" has been created and is ready to use.`,
        });

        // Navigate back to dashboard on success
        router.navigate({ to: '/dashboard' });
      } catch (error) {
        console.error('Failed to create project:', error);

        // Show error toast
        toast.error('Failed to create project', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred. Please try again.',
        });
      }
    },
  });

  const handleRemoveLocale = (localeCode: string) => {
    form.setFieldValue('locales', (prev) => {
      if (prev.length > 1) {
        // Keep at least one locale
        return prev.filter((code) => code !== localeCode);
      }
      return prev;
    });
  };

  const getLocaleDisplayName = (tag: string) => {
    const locale = LOCALE_OPTIONS.find((l) => l.tag === tag);
    return locale ? `${locale.nativeName} (${locale.code})` : tag;
  };

  return (
    <form.AppForm>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.navigate({ to: '/dashboard' })}
              className="mb-4 pl-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Project
            </h1>
            <p className="text-gray-600 mt-2">
              Set up a new localization project with your target locales
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {createProjectMutation.isError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">
                    {createProjectMutation.error instanceof Error
                      ? createProjectMutation.error.message
                      : 'Failed to create project. Please try again.'}
                  </p>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                {/* Project Name */}
                <form.AppField
                  name="name"
                  children={(field) => (
                    <field.FormInput
                      label="Project Name"
                      required
                      placeholder="Enter project name"
                    />
                  )}
                />

                {/* Project Description */}
                <form.AppField
                  name="description"
                  // rows={3}
                  children={(field) => (
                    <field.FormTextarea
                      label="Description"
                      placeholder="Optional project description"
                      rows={3}
                    />
                  )}
                />

                {/* Selected Locales */}
                <form.AppField name="locales">
                  {(field) => {
                    const selectedLocales = field.state.value;

                    return (
                      <div className="space-y-3">
                        <Label>
                          Target Locales{' '}
                          <span className="text-destructive">*</span>
                        </Label>

                        {/* Selected Locales Display */}
                        <div className="flex flex-wrap gap-2">
                          {selectedLocales.map((code: string) => (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="text-sm"
                            >
                              {getLocaleDisplayName(code)}
                              {selectedLocales.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveLocale(code)}
                                  className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </Badge>
                          ))}
                        </div>

                        {/* Locale Selector */}
                        <field.FormSelectMulti
                          label="Add more locales:"
                          placeholder="Select a locale to add..."
                          options={LOCALE_OPTIONS.map((locale) => ({
                            value: locale.tag,
                            label: `${locale.nativeName} (${locale.code}) - ${locale.name}`,
                          }))}
                          filterOptions={(options, selectedValues) =>
                            options.filter(
                              (option) =>
                                !selectedValues?.includes(option.value),
                            )
                          }
                        />
                      </div>
                    );
                  }}
                </form.AppField>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.navigate({ to: '/dashboard' })}
                  >
                    Cancel
                  </Button>
                  <form.FormSubmitButton
                    loadingText={
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </form.FormSubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </form.AppForm>
  );
}
