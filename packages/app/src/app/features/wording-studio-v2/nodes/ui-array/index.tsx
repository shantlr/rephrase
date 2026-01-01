import {
  useReadStoreField,
  useSelectStoreField,
} from '@/app/features/wording-studio/store';
import { useStudioStore } from '../../store';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { ListIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { concatPath } from '../../utils/concat-path';
import {
  SchemaNode,
  SchemaObjectNode,
  SchemaStringNode,
} from '@/server/data/wording.types';
import { SchemaFieldList } from '../ui-schema-field-list';
import { range } from 'lodash-es';
import { formatStringPreview, StringLocaleInputField } from '../ui-string';
import { useState } from 'react';
import { Dropdown } from '@/app/common/ui/dropdown';
import { useImportAssign } from '../../import/ui-assign-panel/use-import-assign';
import { cn } from '@/app/common/lib/utils';

const StringPreview = ({
  valuePath,
  locale,
  pluralized,
}: {
  valuePath: string;
  locale: string;
  pluralized: boolean;
}) => {
  const value = useReadStoreField(
    useStudioStore(),
    `localeValues.${locale}.${valuePath}`,
  );
  return (
    <div className="text-sm text-gray-600">
      {formatStringPreview(value, pluralized)}
    </div>
  );
};

const StringArrayItemPreview = ({
  valuePath,
  pluralized,
}: {
  valuePath: string;
  pluralized: boolean;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const currentValue = useReadStoreField(
    store,
    `localeValues.${selectedLocale}.${valuePath}`,
  );

  const assignmentInfo = useReadStoreField(store, [
    'importWording',
    'assignedValuesMap',
    valuePath,
  ]) as { wordingIndex: number; values: Record<string, string> } | undefined;

  if (assignmentInfo) {
    const newValue = assignmentInfo.values[selectedLocale];
    return (
      <div className="flex items-center gap-2 text-sm flex-1">
        {!!currentValue && (
          <span className="text-gray-400 line-through truncate">
            {formatStringPreview(currentValue, pluralized)}
          </span>
        )}
        <span className="text-green-600 font-medium truncate">
          {formatStringPreview(newValue, pluralized)}
        </span>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600 flex-1 truncate">
      {formatStringPreview(currentValue, pluralized) || (
        <span className="text-gray-400">Click to assign</span>
      )}
    </div>
  );
};

const StringLocaleInput = ({
  valuePath,
  locale,
  html,
  pluralized,
}: {
  valuePath: string;
  locale: string;
  html: boolean;
  pluralized: boolean;
}) => {
  const store = useStudioStore();
  const arrayPath = `localeValues.${locale}.${valuePath}` as const;
  const arrayValue = useReadStoreField(store, arrayPath) as
    | unknown[]
    | undefined;
  const count = arrayValue?.length ?? 0;

  const handleAdd = () => {
    const currentArray = arrayValue ?? [];
    const emptyItem = pluralized ? { one: '', other: '' } : '';
    store.setField(arrayPath, [...currentArray, emptyItem]);
  };

  const handleDelete = (index: number) => {
    const currentArray = arrayValue ?? [];
    store.setField(
      arrayPath,
      currentArray.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="grow flex flex-col gap-1">
      {range(count).map((index) => (
        <div key={index} className="flex items-start gap-1">
          <div className="flex-1">
            <StringLocaleInputField
              locale={locale}
              valuePath={concatPath(valuePath, String(index))}
              html={html}
              pluralized={pluralized}
            />
          </div>
          <button
            onClick={() => handleDelete(index)}
            className="cursor-pointer hover:bg-red-50 rounded p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2Icon size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="cursor-pointer hover:bg-gray-100 rounded p-1"
      >
        <PlusIcon size={12} />
      </button>
    </div>
  );
};

const StringArrayImportView = ({
  itemType,
  valuePath,
}: {
  itemType: SchemaStringNode;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const { isAssigningImportWording, handleAssign } = useImportAssign();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const pathToValue = `localeValues.${selectedLocale}.${valuePath}` as const;
  const arrayValue = useReadStoreField(store, pathToValue) as
    | unknown[]
    | undefined;
  const count = arrayValue?.length ?? 0;

  const handleAdd = () => {
    const currentArray = arrayValue ?? [];
    const emptyItem = itemType.pluralized ? { one: '', other: '' } : '';
    store.setField(pathToValue, [...currentArray, emptyItem]);
  };

  return (
    <div className="w-full flex justify-end">
      <div className="w-full max-w-[500px]">
        <div className="flex flex-col gap-1">
          {range(count).map((index) => {
            const itemPath = concatPath(valuePath, String(index));
            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 rounded px-2 py-1.5 transition-colors',
                  isAssigningImportWording &&
                    'cursor-pointer hover:bg-blue-50 ring-2 ring-blue-200 ring-inset',
                )}
                onClick={() =>
                  isAssigningImportWording && handleAssign(itemPath)
                }
              >
                <span className="text-gray-400">&bull;</span>
                <StringArrayItemPreview
                  valuePath={itemPath}
                  pluralized={!!itemType.pluralized}
                />
              </div>
            );
          })}
          {count === 0 && (
            <span className="text-sm text-gray-500">{'<empty>'}</span>
          )}
          <button
            onClick={handleAdd}
            className="cursor-pointer hover:bg-gray-100 rounded p-1 self-start"
          >
            <PlusIcon size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StringArrayPreview = ({
  itemType,
  valuePath,
}: {
  itemType: SchemaStringNode;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const { isAssigning } = useImportAssign();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const pathToValue = `localeValues.${selectedLocale}.${valuePath}` as const;
  const count = useSelectStoreField(
    store,
    pathToValue,
    (val) => (val as unknown[] | undefined)?.length ?? 0,
  );
  const [open, setOpen] = useState(false);
  const locales = useReadStoreField(store, 'locales');

  if (isAssigning) {
    return <StringArrayImportView itemType={itemType} valuePath={valuePath} />;
  }

  return (
    <div className="w-full flex justify-end">
      <div className="w-full max-w-[500px] relative">
        <Dropdown
          open={open}
          trigger={
            <div
              role="button"
              className="w-full border border-transparent rounded-l  p-1 mt-0.5 cursor-pointer hover:border-gray-500 transition-all"
            >
              {range(count).map((index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-400">&bull;</span>
                  <StringPreview
                    valuePath={concatPath(valuePath, String(index))}
                    locale={selectedLocale}
                    pluralized={!!itemType.pluralized}
                  />
                </div>
              ))}
              {count === 0 && (
                <span className="text-sm text-gray-500">{'<empty>'}</span>
              )}
            </div>
          }
          onOpenChange={setOpen}
        >
          <div className="absolute top-full left-0 w-full p-3 bg-popover shadow-md rounded-md z-50 text-sm flex flex-col gap-2">
            {locales.map((locale) => (
              <div key={locale} className="flex gap-4">
                <div className="text-xs pt-1.5 text-gray-500">{locale}</div>
                <StringLocaleInput
                  valuePath={valuePath}
                  locale={locale}
                  html={!!itemType.html}
                  pluralized={!!itemType.pluralized}
                />
              </div>
            ))}
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

const ObjectArrayItems = ({
  itemType,
  valuePath,
  fieldPath,
  depth = 0,
}: {
  itemType: SchemaObjectNode;
  valuePath: string;
  fieldPath: PathToField;
  depth?: number;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const arrayPath = `localeValues.${selectedLocale}.${valuePath}` as const;

  const count = useSelectStoreField(
    store,
    arrayPath,
    (val) => (val as unknown[] | undefined)?.length ?? 0,
  );

  const itemFieldsSchemaPath = `${fieldPath}.type.itemType.fields` as const;

  const handleAdd = () => {
    const currentArray = (store.getField(arrayPath) as unknown[]) ?? [];
    const emptyItem: Record<string, unknown> = {};
    itemType.fields.forEach((field) => {
      emptyItem[field.name] = null;
    });
    store.setField(arrayPath, [...currentArray, emptyItem]);
  };

  const handleDelete = (index: number) => {
    const currentArray = (store.getField(arrayPath) as unknown[]) ?? [];
    store.setField(
      arrayPath,
      currentArray.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {count === 0 && <span className="text-sm text-gray-500">No items</span>}
      {range(count).map((index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="text-gray-400 mt-1">-</span>
          <div className="flex-1">
            <SchemaFieldList
              schemaPath={itemFieldsSchemaPath}
              valuePath={concatPath(valuePath, String(index))}
              depth={depth}
            />
          </div>
          <button
            onClick={() => handleDelete(index)}
            className="cursor-pointer hover:bg-red-50 rounded p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2Icon size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="cursor-pointer hover:bg-gray-100 rounded p-1 self-start"
      >
        <PlusIcon size={12} />
      </button>
    </div>
  );
};

const NestedArrayItems = ({
  valuePath,
  fieldPath,
  depth = 0,
}: {
  valuePath: string;
  fieldPath: PathToField;
  depth?: number;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const arrayPath = `localeValues.${selectedLocale}.${valuePath}` as const;

  const count = useSelectStoreField(
    store,
    arrayPath,
    (val) => (val as unknown[] | undefined)?.length ?? 0,
  );

  const nestedFieldPath = `${fieldPath}.type.itemType` as PathToField;

  const handleAdd = () => {
    const currentArray = (store.getField(arrayPath) as unknown[]) ?? [];
    store.setField(arrayPath, [...currentArray, []]);
  };

  const handleDelete = (index: number) => {
    const currentArray = (store.getField(arrayPath) as unknown[]) ?? [];
    store.setField(
      arrayPath,
      currentArray.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {count === 0 && <span className="text-sm text-gray-500">No items</span>}
      {range(count).map((index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="text-gray-400 mt-1">-</span>
          <div className="flex-1">
            <SchemaArrayField
              fieldPath={nestedFieldPath}
              valuePath={concatPath(valuePath, String(index))}
              depth={depth}
            />
          </div>
          <button
            onClick={() => handleDelete(index)}
            className="cursor-pointer hover:bg-red-50 rounded p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2Icon size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="cursor-pointer hover:bg-gray-100 rounded p-1 self-start"
      >
        <PlusIcon size={12} />
      </button>
    </div>
  );
};

export const SchemaArrayField = ({
  fieldPath,
  valuePath,
  depth = 0,
}: {
  fieldPath: PathToField;
  valuePath: string;
  depth?: number;
}) => {
  const store = useStudioStore();
  const itemType = useReadStoreField(store, `${fieldPath}.type.itemType`) as
    | SchemaNode
    | undefined;

  return (
    <BaseField
      icon={<ListIcon size={16} className="text-gray-500" />}
      fieldPath={fieldPath}
      valuePath={valuePath}
      depth={depth}
      valuesPreview={
        itemType?.type === 'string'
          ? () => (
              <StringArrayPreview itemType={itemType} valuePath={valuePath} />
            )
          : undefined
      }
    >
      {({ depth }) => (
        <>
          {itemType?.type === 'object' && (
            <ObjectArrayItems
              itemType={itemType}
              valuePath={valuePath}
              fieldPath={fieldPath}
              depth={depth}
            />
          )}
          {itemType?.type === 'array' && (
            <NestedArrayItems
              valuePath={valuePath}
              fieldPath={fieldPath}
              depth={depth}
            />
          )}
        </>
      )}
    </BaseField>
  );
};
