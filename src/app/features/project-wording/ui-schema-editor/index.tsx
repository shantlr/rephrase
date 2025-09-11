import { Button } from '@/app/common/ui/button';
import { PlusIcon } from 'lucide-react';
import { SchemaFormField } from './schema-field';
import { SchemaField } from './types';
import { useProjectWordingForm } from '../use-project-wording-form';

export const SchemaEditor = ({
  form,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  return (
    <form.AppForm>
      <div className="space-y-6">
        {/* Root schema description */}
        <form.AppField
          name="schema.description"
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
            name="schema.fields"
            children={(field) => (
              <>
                {field.state.value.map((f, index) => (
                  <SchemaFormField
                    key={index}
                    name={`schema.fields.${index}`}
                    form={form}
                  />
                ))}
                <div className="py-2 text-center group/end-add">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
                    onClick={() => {
                      form.setFieldValue('schema.fields', (prev) => [
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
      </div>
    </form.AppForm>
  );
};
