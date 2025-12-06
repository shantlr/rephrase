import { memo, useState } from 'react';
import { Button } from '@/app/common/ui/button';
import { PlusIcon, ChevronDownIcon } from 'lucide-react';
import { DeleteButton } from '../_ui-delete-button';
import clsx from 'clsx';
import { MinimalistInput } from '../ui-schema-editor/_minimalist-input';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { StoreField, useReadStoreField, useSelectStoreField } from '../store';
import { range } from 'lodash-es';

type ConstantOptionsPath = `constants.${number}.options`;

const EnumValueItemField = memo(
  ({ arrayName, index }: { arrayName: ConstantOptionsPath; index: number }) => {
    const store = useWordingStudioStore();
    const name = `${arrayName}.${index}` as const;
    const value = useReadStoreField(store, name);

    const removeCurrentItem = () => {
      store?.setField(arrayName, (prev) => {
        if (!prev) {
          return prev;
        }

        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      });
    };

    return (
      <div className="group/value flex gap-1 items-center py-0.5">
        <span className="text-xs text-gray-400 w-3">•</span>
        <MinimalistInput
          className="ml-2"
          placeholder="enum value"
          value={value}
          onChange={(e) => {
            store?.setField(name, e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace') {
              if (!value) {
                removeCurrentItem();
                event.preventDefault();
                event.stopPropagation();
              }
            } else if (event.key === 'Enter') {
              // Add new item
              store?.setField(arrayName, (prev) => {
                if (!prev) {
                  return prev;
                }

                return [
                  ...prev.slice(0, index + 1),
                  '',
                  ...prev.slice(index + 1),
                ];
              });
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        />
        <DeleteButton
          onDelete={() => {
            removeCurrentItem();
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

const EnumValuesField = ({ name }: { name: ConstantOptionsPath }) => {
  const store = useWordingStudioStore();
  const length = useSelectStoreField(store, name, (v) => v?.length ?? 0);

  return (
    <>
      {range(0, length).map((_, index) => (
        <EnumValueItemField key={index} arrayName={name} index={index} />
      ))}
    </>
  );
};

export const EnumConstantField = ({
  constantIndex,
}: {
  constantIndex: number;
}) => {
  const store = useWordingStudioStore();

  const [showValues, setShowValues] = useState(true);
  const constantPath = `constants.${constantIndex}` as const;

  const hasName = useSelectStoreField(
    store,
    `${constantPath}.name`,
    (n) => !!n,
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
        <StoreField
          store={store}
          name={`${constantPath}.name`}
          children={({ value, setValue }) => (
            <MinimalistInput
              value={value}
              placeholder="Enum name"
              onChange={(e) => setValue(e.target.value)}
            />
          )}
        />

        {/* Description input - inline */}
        {/* <form.AppField
          name={`${constantPath}.description`}
          children={(field) => (
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Description..."
              className="flex-1 px-2 py-1 text-sm text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0"
            />
          )}
        /> */}

        {/* Delete enum button */}
        <DeleteButton
          onDelete={() => {
            store?.setField('constants', (prev) => {
              if (!prev) {
                return prev;
              }

              return [
                ...prev.slice(0, constantIndex),
                ...prev.slice(constantIndex + 1),
              ];
            });
          }}
          requireConfirmation={hasName}
          itemType="enum"
        />
      </div>

      {/* Values - compact inline list (collapsible) */}
      {showValues && (
        <div className="ml-6 space-y-0">
          <EnumValuesField name={`${constantPath}.options`} />
          {/* Add value button */}
          <div className="group/add-value py-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 text-blue-600 hover:text-blue-700 text-xs opacity-40 group-hover/add-value:opacity-100 transition-opacity px-1"
              onClick={() => {
                store?.setField(`${constantPath}.options`, (prev) => [
                  ...(prev ?? []),
                  '',
                ]);
              }}
            >
              <PlusIcon className="w-2.5 h-2.5 mr-1" />
              Add enum value
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
