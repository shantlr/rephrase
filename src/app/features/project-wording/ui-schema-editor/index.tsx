import { Button } from '@/app/common/ui/button';
import { PlusIcon } from 'lucide-react';
import { useProjectWordingForm } from '../use-project-wording-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { useField } from '@tanstack/react-form';
import { nanoid } from 'nanoid';
import { SchemaNode } from '@/server/data/wording.types';
import { SchemaObjectFieldsList } from './field-object';

const SelectLocale = ({
  form,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const locales = useField({
    form,
    name: 'locales',
  });
  const selectedLocaleField = useField({
    form,
    name: 'selectedLocale',
  });

  if (locales.state.value.length === 0) {
    return null;
  }

  const selectedLocale = selectedLocaleField.state.value;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Show values for:</span>
      <Select
        value={selectedLocale || ''}
        onValueChange={(value) => {
          selectedLocaleField.setValue(value);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select locale" />
        </SelectTrigger>
        <SelectContent>
          {locales.state.value.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const SchemaEditor = ({
  form,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  return (
    <form.AppForm>
      <div className="w-full px-2 flex flex-col overflow-hidden space-y-6">
        {/* Fields */}
        <div className="w-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wordings</h3>
            <SelectLocale form={form} />
          </div>

          <SchemaObjectFieldsList
            pathToFieldList="schema.root.fields"
            form={form}
            wordingEditable
          />
          <div className="py-2 text-center group/end-add">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
              onClick={() => {
                const newField = {
                  id: nanoid(),
                  type: 'string-template',
                } satisfies SchemaNode;
                form.setFieldValue(`schema.nodes.${newField.id}`, newField);
                form.setFieldValue('schema.root.fields', (prev) => [
                  ...prev,
                  {
                    name: '',
                    typeId: newField.id,
                  },
                ]);
              }}
            >
              <PlusIcon className="w-3 h-3 mr-2" />
              Add field
            </Button>
          </div>
        </div>
      </div>
    </form.AppForm>
  );
};
