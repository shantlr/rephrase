import { memo, useState } from 'react';
import { Button } from '@/app/common/ui/button';
import { PlusIcon, ChevronDownIcon } from 'lucide-react';
import { useProjectWordingForm } from '../use-project-wording-form';
import { DeleteButton } from '../ui-delete-button';
import clsx from 'clsx';
import { useField, useStore } from '@tanstack/react-form';
import { get, range } from 'lodash-es';
import { MinimalistInput } from '../ui-schema-editor/_minimalist-input';

type ConstantOptionsPath = `constants[${number}].options`;

const EnumValueItemField = memo(
  ({
    arrayName,
    index,
    form,
  }: {
    arrayName: ConstantOptionsPath;
    index: number;
    form: ReturnType<typeof useProjectWordingForm>['form'];
  }) => {
    const name = `${arrayName}[${index}]` as const;
    const field = useField({
      form,
      name,
    });

    const value = field.state.value;

    return (
      <div className="group/value flex gap-1 items-center py-0.5">
        <span className="text-xs text-gray-400 w-3">•</span>
        <form.AppField
          name={name}
          children={(field) => (
            <MinimalistInput
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="ml-2"
              placeholder="value"
              onKeyDown={(event) => {
                if (event.key === 'Backspace') {
                  if (field.state.value === '') {
                    form.setFieldValue(arrayName, (prev) => {
                      return [
                        ...prev.slice(0, index),
                        ...prev.slice(index + 1),
                      ];
                    });
                  }
                } else if (event.key === 'Enter') {
                  form.setFieldValue(arrayName, (prev) => {
                    return [
                      ...prev.slice(0, index + 1),
                      '',
                      ...prev.slice(index + 1),
                    ];
                  });
                }
              }}
            />
          )}
        />
        <DeleteButton
          onDelete={() => {
            form.setFieldValue(arrayName, (prev) => {
              return prev.filter((_, i) => i !== index);
            });
          }}
          requireConfirmation={!!value}
          itemName={value}
          itemType="value"
          className="h-4 w-4 p-0 opacity-0 group-hover/value:opacity-60 hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
          size="sm"
        />
      </div>
    );
  },
);
EnumValueItemField.displayName = 'EnumValueItemField';

const EnumValuesField = ({
  name,
  form,
}: {
  name: ConstantOptionsPath;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const length = useStore(form.store, (s) => {
    return get(s.values, name)?.length ?? 0;
  });

  return (
    <>
      {range(0, length).map((value, index) => (
        <EnumValueItemField
          key={index}
          arrayName={name}
          index={index}
          form={form}
        />
      ))}
    </>
  );
};

export const EnumConstantField = ({
  constantIndex,
  form,
}: {
  constantIndex: number;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const [showValues, setShowValues] = useState(true);
  const constantPath = `constants[${constantIndex}]` as const;

  const hasName = useStore(
    form.store,
    (s) => !!s.values.constants[constantIndex]?.name,
  );

  return (
    <div className="w-full mb-1">
      {/* Enum header row */}
      <div className="group flex gap-1 items-center py-1">
        {/* Collapse button */}
        <button
          type="button"
          className={clsx('cursor-pointer transition-all', {
            'rotate-180': showValues,
          })}
          onClick={() => setShowValues((v) => !v)}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {/* Enum name input */}
        <form.AppField
          name={`${constantPath}.name`}
          children={(field) => (
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
              className="font-medium text-sm px-2 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0 w-32"
              placeholder="Name"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  form.setFieldValue(`${constantPath}.options`, (prev) => [
                    '',
                    ...prev,
                  ]);
                }
              }}
            />
          )}
        />

        {/* Description input - inline */}
        <form.AppField
          name={`${constantPath}.description`}
          children={(field) => (
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Description..."
              className="flex-1 px-2 py-1 text-sm text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0"
            />
          )}
        />

        {/* Delete enum button */}
        <DeleteButton
          onDelete={() => {
            form.setFieldValue('constants', (prev) =>
              prev.filter((_, i) => i !== constantIndex),
            );
          }}
          requireConfirmation={hasName}
          itemType="enum"
        />
      </div>

      {/* Values - compact inline list (collapsible) */}
      {showValues && (
        <div className="ml-6 space-y-0">
          <EnumValuesField name={`${constantPath}.options`} form={form} />
          {/* Add value button */}
          <div className="group/add-value py-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 text-blue-600 hover:text-blue-700 text-xs opacity-40 group-hover/add-value:opacity-100 transition-opacity px-1"
              onClick={() => {
                form.setFieldValue(`${constantPath}.options`, (prev) => [
                  ...prev,
                  '',
                ]);
              }}
            >
              <PlusIcon className="w-2.5 h-2.5 mr-1" />
              Add value
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
