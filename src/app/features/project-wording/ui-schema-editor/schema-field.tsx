import { useField } from '@tanstack/react-form';
import { useProjectWordingForm } from '../use-project-wording-form';
import { SchemaField } from './types';
import clsx from 'clsx';
import { memo, ReactNode, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/app/common/ui/select';
import { Button } from '@/app/common/ui/button';
import {
  ChevronDownIcon,
  PlusIcon,
  TypeIcon,
  PackageIcon,
  ListIcon,
} from 'lucide-react';
import { DeleteButton } from '../ui-delete-button';
import { objectSchemaFieldNameValidator } from '@/server-functions/project-wording/validator';
import { useFormError } from '@/app/common/hooks/use-form-error';

export const SchemaFormField = memo(
  ({
    name,
    form,
  }: {
    name: string;
    form: ReturnType<typeof useProjectWordingForm>['form'];
  }) => {
    const fieldType = useField({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: `${name}.type.type` as any,
      form,
    });

    const fieldName = useField({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: `${name}.name` as any,
      form,
    });

    const fieldTypeValue = fieldType.state.value as SchemaField['type']['type'];
    const fieldNameValue = fieldName.state.value as string;

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

    const handleDelete = () => {
      if (!addBelow) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setFieldValue(addBelow.arrayName as any, (prev: unknown[]) => {
        if (!Array.isArray(prev)) {
          return prev;
        }
        return prev.filter((_, index) => index !== addBelow.index);
      });
    };

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
          <DeleteButton
            onDelete={handleDelete}
            requireConfirmation={!!fieldNameValue}
            itemName={fieldNameValue}
            itemType="field"
          />
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
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const fieldType = useField({
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  const fieldTypeValue = fieldType.state
    .value as unknown as SchemaField['type'];

  const typeOptions = useMemo(() => {
    return [
      {
        value: 'string-template',
        label: 'String Template',
        icon: <TypeIcon />,
      },
      {
        value: 'object',
        label: 'Object',
        icon: <PackageIcon />,
      },
      {
        value: 'array',
        label: 'Array',
        icon: <ListIcon />,
      },
    ] as {
      value: SchemaField['type']['type'];
      label: string;
      icon: ReactNode;
    }[];
  }, []);

  const currentOption = useMemo(() => {
    return typeOptions.find((option) => option.value === fieldTypeValue?.type);
  }, [fieldTypeValue?.type, typeOptions]);

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
        className="flex items-center justify-center"
        hideChevron
      >
        {currentOption?.icon}
      </SelectTrigger>
      <SelectContent>
        {typeOptions.map((option) => {
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

const SchemaFieldName = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const nameField = useField({
    form,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${name}.name` as any,
    validators: {
      onChange: objectSchemaFieldNameValidator,
    },
  });

  const error = useFormError(nameField.state.meta.errors);

  return (
    <>
      <div className="w-full relative">
        <input
          value={nameField.state.value as string}
          onChange={(e) => nameField.setValue(e.target.value)}
          className={clsx('w-full px-2 text-sm py-1 ', {
            'border-b border-input rounded focus:border-none':
              !nameField.state.value,
            'focus:border-none': !!nameField.state.value,
          })}
        />
        {error && (
          <div className="absolute top-[20px] left-2 opacity-50 bg-red-500 text-white px-2 rounded z-1 text-sm mt-1">
            {error}
          </div>
        )}
      </div>
    </>
  );
};

const TypeDetails = ({
  name,
  form,
  show,
  addBelow,
}: {
  name: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
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
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  return null;
};

const ArrayField = ({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
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
  form: ReturnType<typeof useProjectWordingForm>['form'];
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
  form: ReturnType<typeof useProjectWordingForm>['form'];
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
