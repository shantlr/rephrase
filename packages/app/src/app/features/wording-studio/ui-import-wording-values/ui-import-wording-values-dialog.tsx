import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/common/ui/dialog';
import { Button } from '@/app/common/ui/button';
import { ChevronLeft } from 'lucide-react';
import { ImportFormStep } from './ui-import-form-step';
import { ImportPreviewStep } from './ui-import-preview-step';
import { ImportConfirmStep } from './ui-import-confirm-step';
import {
  UseImportWordingValuesResult,
  ImportStep,
} from '../use-import-wording-values';

export interface ImportWordingValuesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableLocales: string[];
  state: UseImportWordingValuesResult;
}

function getStepProgress(step: ImportStep): number {
  const steps: ImportStep[] = ['form', 'preview', 'confirm'];
  return ((steps.indexOf(step) + 1) / steps.length) * 100;
}

function getStepNumber(step: ImportStep): number {
  const steps: ImportStep[] = ['form', 'preview', 'confirm'];
  return steps.indexOf(step) + 1;
}

function getStepTitle(step: ImportStep): string {
  const titles: Record<ImportStep, string> = {
    form: 'Import Values',
    preview: 'Review Import',
    confirm: 'Confirm Import',
  };
  return titles[step];
}

function getStepDescription(step: ImportStep): string {
  const descriptions: Record<ImportStep, string> = {
    form: 'Paste your wording data (JSON or TypeScript) and select target locale',
    preview: 'Review the parsed data and validation results',
    confirm: 'Confirm the import settings and complete the import',
  };
  return descriptions[step];
}

export function ImportWordingValuesDialog({
  isOpen,
  onOpenChange,
  availableLocales,
  state,
}: ImportWordingValuesDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    state.reset();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle>{getStepTitle(state.step)}</DialogTitle>
              <DialogDescription>
                Step {getStepNumber(state.step)} of 3 •{' '}
                {getStepDescription(state.step)}
              </DialogDescription>
            </div>
            {state.step !== 'form' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={state.handlePreviousStep}
                disabled={state.step === 'form' || state.isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${getStepProgress(state.step)}%` }}
          />
        </div>

        <div className="py-4">
          {state.step === 'form' && (
            <ImportFormStep
              content={state.content}
              setContent={state.setContent}
              selectedLocale={state.selectedLocale}
              setSelectedLocale={state.setSelectedLocale}
              availableLocales={availableLocales}
              isLoading={state.isLoading}
              error={state.error}
              parseSuccess={state.parseSuccess}
              validationErrors={state.validationErrors}
              onParse={state.handleParse}
            />
          )}

          {state.step === 'preview' && (
            <div className="space-y-4">
              <ImportPreviewStep
                previewStructure={state.previewStructure}
                previewStats={state.previewStats}
                validationErrors={state.validationErrors}
                warnings={state.warnings}
              />
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={state.handlePreviousStep}
                  disabled={state.isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={state.handleNextStep}
                  disabled={state.isLoading}
                  className="flex-1"
                >
                  Review Import Settings
                </Button>
              </div>
            </div>
          )}

          {state.step === 'confirm' && (
            <ImportConfirmStep
              selectedLocale={state.selectedLocale}
              overwriteStrategy={state.overwriteStrategy}
              setOverwriteStrategy={state.setOverwriteStrategy}
              previewStats={state.previewStats}
              isLoading={state.isLoading}
              onImport={async () => {
                await state.handleImport();
                handleClose();
              }}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
