import { Button } from '@/app/common/ui/button';
import { PlusIcon } from 'lucide-react';
import { EnumFormField } from './enum-field';
import { useProjectWordingForm } from '../use-project-wording-form';
import { EnumDefinition } from './types';
import { memo } from 'react';
import { useStore } from '@tanstack/react-form';
import { range } from 'lodash-es';

const EnumItemField = memo(
  ({
    enumIndex: index,
    form,
  }: {
    enumIndex: number;
    form: ReturnType<typeof useProjectWordingForm>['form'];
  }) => {
    return (
      <div key={index} className="group/item">
        <EnumFormField enumIndex={index} form={form} />
        {/* Subtle add line between enums */}
        <div className="group/add-line h-px bg-transparent hover:bg-gray-50 relative">
          <div className="absolute inset-0 flex items-center justify-start pl-3 opacity-0 group-hover/add-line:opacity-100 transition-opacity">
            <Button
              onClick={() => {
                form.setFieldValue('enums', (prev) => [
                  ...prev.slice(0, index + 1),
                  {
                    name: `enum_${Date.now()}`,
                    description: '',
                    values: [],
                  },
                  ...prev.slice(index + 1),
                ]);
              }}
              variant="ghost"
              size="sm"
              className="h-4 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add enum
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
EnumItemField.displayName = 'EnumItemField';

export const EnumsEditor = ({
  form,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const enumCount = useStore(form.store, (s) => s.values.enums?.length ?? 0);

  return (
    <div className="space-y-6">
      <div className="">
        <h3 className="text-lg font-semibold mb-4">Enums</h3>

        {range(0, enumCount).map((_, index) => (
          <>
            <EnumItemField key={index} enumIndex={index} form={form} />
          </>
        ))}
        {/* Add enum at the end */}
        <div className="py-2 text-center group/end-add">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
            onClick={() => {
              form.setFieldValue('enums', (prev) => [
                ...prev,
                {
                  name: '',
                  description: '',
                  values: [],
                } satisfies EnumDefinition,
              ]);
            }}
          >
            <PlusIcon className="w-3 h-3 mr-2" />
            Add enum
          </Button>
        </div>
      </div>
    </div>
  );
};
