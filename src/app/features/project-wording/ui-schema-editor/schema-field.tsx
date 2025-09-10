import { useField } from '@tanstack/react-form';
import { useSchemaForm } from './use-schema-form';
import { SchemaField } from './types';
import clsx from 'clsx';
import { memo, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Button } from '@/app/common/ui/button';
import { ChevronDownIcon, PlusIcon, TrashIcon } from 'lucide-react';

export const SchemaFormField = memo(
  ({
    name,
    form,
  }: {
    name: string;
    form: ReturnType<typeof useSchemaForm>['form'];
  }) => {
    const fieldType = useField({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: `${name}.type.type` as any,
      form,
    });
    const fieldTypeValue = fieldType.state.value as SchemaField['type']['type'];
    const isExpandble = useMemo(() => {
      return (
        (fieldTypeValue as SchemaField['type']['type']) === 'array' ||
        (fieldTypeValue as SchemaField['type']['type']) === 'object'
      );
    }, [fieldTypeValue]);

    const [showDetails, setShowDetails] = useState(true);

    const addBelow = useMemo(() => {
      const m = name.match(/(?<prefix>.*)\.(?<index>[0-9]+)/);
      if (m) {
        return {
          arrayName: m.groups?.prefix ?? '',
          index: Number(m.groups?.index),
        };
      }
      return undefined;
    }, []);

    return (
      <div className="w-full">
        <div className="group flex gap-1 items-center">
          {isExpandble && (
            <button
              type="button"
              className={clsx('cursor-pointer transition-all', {
                'rotate-180': showDetails,
              })}
              onClick={() => setShowDetails((v) => !v)}
            >
              <ChevronDownIcon />
            </button>
          )}
          <SelectFieldType name={`${name}.type`} form={form} />
          <SchemaFieldName name={name} form={form} />
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity focus:opacity-100"
            // onClick={onDelete}
            title="Delete field"
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        </div>
        <TypeDetails
          name={`${name}.type`}
          form={form}
          show={showDetails}
          addBelow={addBelow}
        />
      </div>
    );
  },
);
SchemaFormField.displayName = 'SchemaFormField';

const SelectFieldType = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  const fieldType = useField({
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  const fieldTypeValue = fieldType.state.value as SchemaField['type'];

  const typeOptions: SchemaField['type']['type'][] = [
    'string-template',
    'object',
    'array',
  ];
  return (
    <Select
      value={fieldTypeValue?.type}
      onValueChange={(newType) => {
        switch (newType as SchemaField['type']['type']) {
          case 'string-template': {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setFieldValue(name as any, {
              type: 'string-template',
              description: '',
            } satisfies SchemaField['type']);
            break;
          }
          case 'object': {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setFieldValue(name as any, {
              type: 'object',
              description: '',
              fields: [],
            } satisfies SchemaField['type']);
            break;
          }
          case 'array': {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setFieldValue(name as any, {
              type: 'array',
              description: '',
              item: {
                type: 'string-template',
                description: '',
              },
            } satisfies SchemaField['type']);
            break;
          }
        }
      }}
    >
      <SelectTrigger
        size="sm"
        // className="w-20 min-h-0 text-xs border-0 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border px-2 py-0 flex items-center"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {typeOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const SchemaFieldName = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  const nameField = useField({
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${name}.name` as any,
  });

  return (
    <input
      value={nameField.state.value as string}
      onChange={(e) => nameField.setValue(e.target.value)}
      className={clsx('w-full px-2 text-sm py-1 ', {
        'border-b border-input rounded focus:border-none':
          !nameField.state.value,
        'focus:border-none': !!nameField.state.value,
      })}
    />
  );
};

const TypeDetails = ({
  name,
  form,
  show,
  addBelow,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
  show: boolean;
  addBelow?: { arrayName: string; index: number } | null;
}) => {
  const fieldType = useField({
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${name}.type` as any,
  });

  const fieldTypeValue = fieldType.state.value as SchemaField['type']['type'];

  const fieldElem = useMemo(() => {
    switch (fieldTypeValue) {
      case 'string-template': {
        return <StringTemplate name={name} form={form} />;
      }
      case 'array': {
        return <ArrayField name={name} form={form} />;
      }
      case 'object': {
        return <ObjectField name={name} form={form} />;
      }
      default:
    }

    return null;
  }, [fieldTypeValue]);

  return (
    <div className="w-full">
      {!!show && fieldElem}
      {/* Add field below current index */}
      {!!addBelow && (
        <div className="group/add-line h-1 bg-transparent hover:bg-gray-50 relative">
          <div className="absolute inset-0 flex items-center justify-start opacity-0 group-hover/add-line:opacity-100 transition-opacity">
            <Button
              onClick={() => {
                form.setFieldValue(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  addBelow.arrayName as any,
                  (prev: unknown) => {
                    // Just in case
                    if (!Array.isArray(prev)) {
                      return prev;
                    }

                    return [
                      ...prev.slice(0, addBelow.index + 1),
                      {
                        name: '',
                        type: { type: 'string-template', description: '' },
                      },
                      ...prev.slice(addBelow.index + 1),
                    ];
                  },
                );
              }}
              variant="ghost"
              size="sm"
              className="h-4 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add field
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
// eslint-disable-next-line no-empty-pattern
const StringTemplate = ({}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  return null;
};

const ArrayField = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  return (
    <div className="w-full">
      <div className="border-l border-gray-300 ml-4 pl-4">
        <div className="flex items-center gap-2 text-sm">
          Item type
          <SelectFieldType name={`${name}.item`} form={form} />
        </div>
        <TypeDetails name={`${name}.item`} form={form} show />
      </div>
    </div>
  );
};

const ObjectField = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  return (
    <div className="w-full pl-4 border-l border-gray-300 ml-4">
      <InlineAppend
        onClick={() => {
          form.setFieldValue(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${name}.fields` as any,
            (prev: unknown) => {
              // Just in case
              if (!Array.isArray(prev)) {
                return prev;
              }

              return [
                {
                  name: '',
                  type: { type: 'string-template', description: '' },
                },
                ...prev,
              ];
            },
          );
        }}
      />
      <ArrayFields name={`${name}.fields`} form={form} />
    </div>
  );
};

export const ArrayFields = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useSchemaForm>['form'];
}) => {
  return (
    <>
      <form.AppField
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={name as any}
        children={(field) => (
          <>
            {(field.state.value as unknown[]).map((item, index) => (
              <div key={index}>
                {/* Render each item in the array */}
                <SchemaFormField
                  key={index}
                  name={`${name}.${index}`}
                  form={form}
                />
              </div>
            ))}
          </>
        )}
      />
    </>
  );
};

const InlineAppend = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="group/add-line h-1 bg-transparent hover:bg-gray-50 relative">
      <div className="absolute inset-0 flex items-center justify-start opacity-0 group-hover/add-line:opacity-100 transition-opacity">
        <Button
          onClick={onClick}
          variant="ghost"
          size="sm"
          className="h-4 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <PlusIcon className="w-3 h-3 mr-1" />
          Add field
        </Button>
      </div>
    </div>
  );
};
