import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { ArrowLeft, KeyRound, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/app/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { useProjects } from '@/app/features/projects/use-projects';
import { useCreateApiToken } from '@/app/features/api-tokens/use-api-tokens';
import { useAppForm } from '@/app/common/hooks/use-app-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { addDays, addYears } from 'date-fns';
import { useProjectBranches } from '@/app/features/projects/use-project-branches';
import { TokenModal } from '@/app/features/api-tokens/token-modal';
import { useStore } from '@tanstack/react-form';
import { useState } from 'react';

const resourceSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  branchId: z.string().nullable(),
  scopes: z
    .array(z.enum(['read', 'write']))
    .min(1, 'Select at least one scope'),
});

const createTokenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expiresAt: z
    .date()
    .refine((value) => value > new Date(), {
      message: 'Expiration must be in the future',
    })
    .refine((value) => value <= addYears(new Date(), 2), {
      message: 'Expiration cannot exceed 2 years',
    }),
  resources: resourceSchema.array().min(1, 'At least one resource is required'),
});

export const Route = createFileRoute('/_authenticated/api-tokens/create')({
  component: RouteComponent,
});

const useForm = ({
  onSubmit,
}: {
  onSubmit: (args: {
    value: z.infer<typeof createTokenSchema>;
  }) => Promise<void>;
}) => {
  return useAppForm({
    defaultValues: {
      name: '',
      expiresAt: addDays(new Date(), 30),
      resources: [
        {
          projectId: '',
          branchId: null,
          scopes: ['read'],
        },
      ],
    } as z.infer<typeof createTokenSchema>,
    validators: {
      onChange: createTokenSchema,
    },
    onSubmit,
  });
};

function RouteComponent() {
  const router = useRouter();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const createToken = useCreateApiToken();
  const [issuedToken, setIssuedToken] = useState<string | null>(null);

  const form = useForm({
    onSubmit: async ({ value }) => {
      try {
        const result = await createToken.mutateAsync({
          name: value.name,
          expiresAt: value.expiresAt,
          resources: value.resources,
        });

        if (result.token) {
          setIssuedToken(result.token);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to create token');
      }
    },
  });

  const removeResource = (index: number) => {
    form.setFieldValue('resources', (prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const projectOptions = projectsData?.projects || [];

  return (
    <form.AppForm>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button asChild variant="ghost" className="pl-0">
                <Link to="/api-tokens" className="inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to API tokens
                </Link>
              </Button>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-muted-foreground" />
                Create API Token
              </h1>
              <p className="text-muted-foreground mt-1">
                Tokens can be scoped to multiple projects and branches with
                per-resource permissions.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Token details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form.AppField name="name">
                {(field) => (
                  <field.FormInput
                    label="Name"
                    placeholder="e.g. CI sync, staging env"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="expiresAt">
                {(field) => (
                  <field.FormDateInput
                    label="Expiration"
                    required
                    min={new Date()}
                    max={addYears(new Date(), 2)}
                  />
                )}
              </form.AppField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources & scopes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.AppField name="resources">
                {(field) => (
                  <>
                    {field.state.value.map((_resource, index) => (
                      <ResourceRow
                        key={index}
                        index={index}
                        form={form}
                        projectOptions={projectOptions}
                        projectsLoading={projectsLoading}
                        onRemove={() => removeResource(index)}
                        canRemove={field.state.value.length > 1}
                      />
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setFieldValue('resources', (prev) => [
                          ...prev,
                          { projectId: '', branchId: null, scopes: ['read'] },
                        ]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add resource
                    </Button>
                  </>
                )}
              </form.AppField>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.navigate({ to: '/api-tokens' })}
            >
              Cancel
            </Button>
            <form.FormSubmitButton
              loadingText={
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              }
            >
              Create token
            </form.FormSubmitButton>
          </div>
        </div>
      </div>
      <TokenModal
        token={issuedToken}
        onClose={() => {
          setIssuedToken(null);
          router.navigate({ to: '/api-tokens' });
        }}
      />
    </form.AppForm>
  );
}

function ResourceRow({
  index,
  form,
  projectOptions,
  projectsLoading,
  onRemove,
  canRemove,
}: {
  index: number;
  form: ReturnType<typeof useForm>;
  projectOptions: { id: string; name: string }[];
  projectsLoading: boolean;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const projectId = useStore(
    form.store,
    (state) => state.values.resources[index]?.projectId,
  );
  const { data: branchesData, isLoading: branchesLoading } =
    useProjectBranches(projectId);
  const branchOptions = branchesData?.branches ?? [];

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <form.AppField name={`resources[${index}].projectId`}>
            {(field) => (
              <field.FormSelect
                label="Project"
                placeholder="Select project"
                options={projectOptions.map((project) => ({
                  value: project.id,
                  label: project.name,
                }))}
                disabled={projectsLoading}
              />
            )}
          </form.AppField>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove resource"
          onClick={onRemove}
          disabled={!canRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <form.AppField name={`resources[${index}].branchId`}>
        {(field) => (
          <field.FormSelect
            label="Branch (optional)"
            placeholder={branchesLoading ? 'Loading…' : 'All branches'}
            options={branchOptions.map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
            disabled={branchesLoading || !projectId}
          />
        )}
      </form.AppField>

      <form.AppField name={`resources[${index}].scopes`}>
        {(field) => (
          <field.FormCheckboxGroup
            label="Scopes"
            options={[
              { label: 'Read', value: 'read' },
              { label: 'Write', value: 'write' },
            ]}
          />
        )}
      </form.AppField>
    </div>
  );
}
