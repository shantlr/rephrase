import { CheckIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';

export type ImportStep = 'infer-schema' | 'edit-schema' | 'complete';

const steps = [
  {
    id: 'infer-schema' as const,
    name: 'Infer Schema',
    description: 'Parse content and detect schema',
  },
  {
    id: 'edit-schema' as const,
    name: 'Edit Schema',
    description: 'Refine and customize schema',
  },
  {
    id: 'complete' as const,
    name: 'Complete',
    description: 'Schema imported successfully',
  },
];

interface ImportProgressBarProps {
  currentStep: ImportStep;
  onStepClick?: (step: ImportStep) => void;
  canNavigateToStep?: (step: ImportStep) => boolean;
}

export function ImportProgressBar({
  currentStep,
  onStepClick,
  canNavigateToStep,
}: ImportProgressBarProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full py-6">
      <nav aria-label="Import progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentStepIndex;
            const isCurrent = step.id === currentStep;
            const canNavigate = canNavigateToStep?.(step.id) ?? false;
            const isClickable = onStepClick && (isCompleted || canNavigate);

            return (
              <li
                key={step.id}
                className={cn(
                  stepIdx !== steps.length - 1 ? 'flex-1' : '',
                  'relative',
                )}
              >
                <div className="flex items-center">
                  {/* Step circle */}
                  <div
                    className={cn(
                      'relative flex h-8 w-8 items-center justify-center rounded-full',
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                          ? 'border-2 border-blue-600 bg-white text-blue-600'
                          : 'border-2 border-gray-300 bg-white text-gray-500',
                      isClickable && 'cursor-pointer hover:bg-blue-50',
                    )}
                    onClick={
                      isClickable ? () => onStepClick(step.id) : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{stepIdx + 1}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <div
                    className={cn(
                      'ml-3 min-w-0',
                      isClickable && 'cursor-pointer',
                    )}
                    onClick={
                      isClickable ? () => onStepClick(step.id) : undefined
                    }
                  >
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-500',
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>

                  {/* Connector line */}
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-4 left-8 -ml-px h-0.5 w-full',
                        stepIdx < currentStepIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-300',
                      )}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
