import {
  useReadStoreField,
  useSelectStoreField,
} from '@/app/features/wording-studio/store';
import { useStudioStore } from '../../store';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { ListIcon } from 'lucide-react';
import { concatPath } from '../../utils/concat-path';
import { SchemaNode, SchemaStringNode } from '@/server/data/wording.types';
import { range } from 'lodash-es';
import { formatStringPreview } from '../ui-string';
import { useState } from 'react';
import { Dropdown } from '@/app/common/ui/dropdown';

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

const StringArrayPreview = ({
  itemType,
  valuePath,
}: {
  itemType: SchemaStringNode;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const pathToValue = `localeValues.${selectedLocale}.${valuePath}` as const;
  const count = useSelectStoreField(
    store,
    pathToValue,
    (val) => (val as unknown[] | undefined)?.length ?? 0,
  );
  const [open, setOpen] = useState(false);
  const locales = useReadStoreField(store, 'locales');

  return (
    <div className="w-full flex justify-end relative">
      <Dropdown
        open={open}
        trigger={
          <div
            role="button"
            className="w-full max-w-[500px] border rounded-l border-gray-300 p-1 mt-0.5 cursor-pointer hover:border-gray-500 transition-all"
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
          </div>
        }
        onOpenChange={setOpen}
      >
        <div className="absolute top-full right-0 p-3 bg-popover shadow-md rounded-md z-50 text-10">
          {locales.map((locale) => (
            <div key={locale} className="mb-2">
              <div className="font-medium mb-1">{locale}</div>
              {/* {range(count).map((index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-400">&bull;</span>
                  <StringPreview
                    valuePath={concatPath(valuePath, String(index))}
                    locale={locale}
                    pluralized={!!itemType.pluralized}
                  />
                </div>
              ))} */}
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

const LocaleInput = () => {};

export const SchemaArrayField = ({
  fieldPath,
  valuePath,
}: {
  fieldPath: PathToField;
  valuePath: string;
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
      valuesPreview={
        itemType?.type === 'string'
          ? () => (
              <StringArrayPreview itemType={itemType} valuePath={valuePath} />
            )
          : undefined
      }
    >
      {() => (
        <div className="ml-4">
          {/* <SchemaFieldList schemaPath={`${typePath}.items`} /> */}
        </div>
      )}
    </BaseField>
  );
};
