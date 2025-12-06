import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/app/common/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useProject } from '@/app/features/projects/use-projects';
import { useUpdateProjectWordingsBranch } from '@/app/features/wording-studio/use-project-wording';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  ImportProgressBar,
  ImportStep,
} from '@/app/features/import-wording/ui-import-progress-bar';
import { InferSchemaStep } from '@/app/features/import-wording/ui-infer-schema-step';
import { EditInferredSchemaStep } from '@/app/features/import-wording/ui-edit-inferred-schema-step';
import {
  WordingData,
  WordingEnumConstant,
  WordingStringConstant,
} from '@/server/data/wording.types';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/import',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectId);
  const updateBranch = useUpdateProjectWordingsBranch();

  const [currentStep, setCurrentStep] = useState<ImportStep>('infer-schema');
  const [inferredData, setInferredData] = useState<{
    schema: WordingData['schema'];
    localeTag: string;
  } | null>(null);

  const handleInferSchemaNext = (data: {
    schema: WordingData['schema'];
    localeTag: string;
  }) => {
    setInferredData(data);
    setCurrentStep('edit-schema');
  };

  const handleEditSchemaBack = () => {
    setCurrentStep('infer-schema');
  };

  const handleImport = async (data: {
    schema: WordingData['schema'];
    localeTag: string;
    constants?: (WordingEnumConstant | WordingStringConstant)[];
  }) => {
    try {
      if (!project?.defaultBranch?.id) {
        throw new Error('Default branch not found');
      }

      await updateBranch.mutateAsync({
        branchId: project.defaultBranch.id,
        config: {
          schema: data.schema,
          constants: data.constants || [],
        },
      });

      setCurrentStep('complete');

      toast.success('Schema imported successfully!', {
        description: `Wording schema has been created for locale "${data.localeTag}".`,
      });

      // Navigate back to project page after a short delay
      // setTimeout(() => {
      //   router.navigate({
      //     to: '/projects/$projectId',
      //     params: { projectId },
      //   });
      // }, 2000);
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

  const canNavigateToStep = (step: ImportStep): boolean => {
    switch (step) {
      case 'infer-schema':
        return true;
      case 'edit-schema':
        return inferredData !== null;
      case 'complete':
        return currentStep === 'complete';
      default:
        return false;
    }
  };

  const handleStepClick = (step: ImportStep) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
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

          {/* Progress Bar */}
          <ImportProgressBar
            currentStep={currentStep}
            onStepClick={handleStepClick}
            canNavigateToStep={canNavigateToStep}
          />

          {/* Step Content */}
          {currentStep === 'infer-schema' && (
            <InferSchemaStep onNext={handleInferSchemaNext} />
          )}

          {currentStep === 'edit-schema' && inferredData && (
            <EditInferredSchemaStep
              initialSchema={inferredData.schema}
              localeTag={inferredData.localeTag}
              onBack={handleEditSchemaBack}
              onImport={handleImport}
              isImporting={updateBranch.isPending}
            />
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schema Imported Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your wording schema has been created and you will be
                  redirected to the project page shortly.
                </p>
                <Button asChild>
                  <Link to="/projects/$projectId" params={{ projectId }}>
                    Go to Project
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
