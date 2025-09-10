import { Button } from '@/app/common/ui/button';
import { PlusIcon, SaveIcon } from 'lucide-react';
import { useSchemaForm } from './use-schema-form';
import { SchemaFormField } from './schema-field';
import { Schema, SchemaField } from './types';

export const SchemaEditor = ({
  schema: initialSchema,
  onSubmit,
  isLoading = false,
}: {
  schema: Schema;
  onSubmit: (schema: Schema) => void;
  isLoading?: boolean;
}) => {
  const { form } = useSchemaForm({
    initialSchema,
    onSubmit: (values) => {
      return onSubmit(values);
    },
  });

  return (
    <form.AppForm>
      <div className="space-y-6">
        {/* Root schema description */}
        <form.AppField
          name="description"
          children={(field) => (
            <field.FormTextarea
              label="Schema Description"
              placeholder="Describe the purpose of this schema..."
              rows={2}
              className="w-full"
            />
          )}
        />

        {/* Fields */}
        <div className="">
          <h3 className="text-lg font-semibold mb-4">Fields</h3>

          <form.AppField
            name="fields"
            children={(field) => (
              <>
                {field.state.value.map((f, index) => (
                  <SchemaFormField
                    key={index}
                    name={`fields.${index}`}
                    form={form}
                  />
                ))}
                <div className="py-2 text-center group/end-add">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
                    onClick={() => {
                      form.setFieldValue('fields', (prev) => [
                        ...prev,
                        {
                          name: '',
                          type: { type: 'string-template', description: '' },
                        } satisfies SchemaField,
                      ]);
                    }}
                  >
                    <PlusIcon className="w-3 h-3 mr-2" />
                    Add field
                  </Button>
                </div>
              </>
            )}
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <form.FormSubmitButton>
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <SaveIcon className="w-4 h-4 mr-2" />
                Save Schema
              </>
            )}
          </form.FormSubmitButton>
        </div>
      </div>
    </form.AppForm>
  );
};
