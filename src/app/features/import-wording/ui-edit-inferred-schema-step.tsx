import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Button } from '@/app/common/ui/button';
import { ArrowLeftIcon, SaveIcon, EditIcon } from 'lucide-react';
import {
  WordingData,
  WordingEnumConstant,
  WordingStringConstant,
} from '@/server/data/wording.types';
import { SchemaEditor } from '@/app/features/wording-studio/ui-schema-editor';
import { ConstantsField } from '@/app/features/wording-studio/ui-constants-field';
import { useProjectWordingForm } from '@/app/features/wording-studio/use-project-wording-form';

interface EditInferredSchemaStepProps {
  initialSchema: WordingData['schema'];
  localeTag: string;
  onBack: () => void;
  onImport: (data: {
    schema: WordingData['schema'];
    localeTag: string;
    constants?: (WordingEnumConstant | WordingStringConstant)[];
  }) => void;
  isImporting?: boolean;
}

export function EditInferredSchemaStep({
  initialSchema,
  localeTag,
  onBack,
  onImport,
  isImporting = false,
}: EditInferredSchemaStepProps) {
  const { form } = useProjectWordingForm({
    initialValues: {
      constants: [],
      schema: initialSchema,
      locales: [localeTag],
      selectedLocale: localeTag,
    },
    onSubmit: async ({ schema, constants }) => {
      onImport({
        schema,
        localeTag,
        constants,
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EditIcon className="w-5 h-5" />
            Edit Inferred Schema
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Refine the automatically inferred schema structure before importing.
            You can add, remove, or modify fields and their types.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Target locale:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
              {localeTag}
            </span>
          </div>
        </CardContent>
      </Card>

      <form.AppForm>
        {/* Constants Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Constants</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define global constants and enums that can be used throughout your
              schema.
            </p>
          </CardHeader>
          <CardContent>
            <ConstantsField form={form} />
          </CardContent>
        </Card>

        {/* Schema Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schema Structure</CardTitle>
            <p className="text-sm text-muted-foreground">
              Edit the structure of your wording schema. Fields were
              automatically inferred from your input.
            </p>
          </CardHeader>
          <CardContent>
            <SchemaEditor form={form} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isImporting}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Infer Schema
          </Button>

          <form.FormSubmitButton disabled={isImporting}>
            {isImporting ? (
              'Importing...'
            ) : (
              <>
                <SaveIcon className="w-4 h-4 mr-2" />
                Import Schema
              </>
            )}
          </form.FormSubmitButton>
        </div>
      </form.AppForm>
    </div>
  );
}
