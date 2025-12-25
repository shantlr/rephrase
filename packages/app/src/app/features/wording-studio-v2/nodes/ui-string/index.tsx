import { TypeIcon } from 'lucide-react';
import FocusLock from 'react-focus-lock';

import { Dropdown } from '@/app/common/ui/dropdown';
import { useReadStoreField } from '@/app/features/wording-studio/store';
import { MinimalistInput } from '@/app/features/wording-studio/ui-schema-editor/_minimalist-input';

import { useStudioStore } from '../../store';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { useListenKeyboard } from '@/app/common/hooks/use-listen-keyboard';
import { useInputFocusDropdownState } from '@/app/common/hooks/use-input-focus-dropdown-state';

type PluralValue = { one: string; other: string };

const LocaleTextarea = ({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const rows = Math.max(1, value.split('\n').length);

  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full font-medium text-sm px-0 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0 resize-none"
    />
  );
};

const LocaleInput = ({
  locale,
  valuePath,
  pluralized = false,
}: {
  locale: string;
  valuePath: string;
  pluralized?: boolean;
}) => {
  const store = useStudioStore();
  const currentLocalePath = `localeValues.${locale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocalePath);

  if (pluralized) {
    const pluralValue = (value as PluralValue | undefined) ?? {
      one: '',
      other: '',
    };

    return (
      <div className="flex items-start gap-4">
        <span className="text-xs text-gray-500 w-8 shrink-0 whitespace-nowrap pt-1">
          {locale}
        </span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-10 shrink-0 pt-1">
              one
            </span>
            <LocaleTextarea
              value={pluralValue.one}
              placeholder="<one>"
              onChange={(v) =>
                store.setField(currentLocalePath, { ...pluralValue, one: v })
              }
            />
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-10 shrink-0 pt-1">
              other
            </span>
            <LocaleTextarea
              value={pluralValue.other}
              placeholder="<other>"
              onChange={(v) =>
                store.setField(currentLocalePath, { ...pluralValue, other: v })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const stringValue = String(value ?? '');

  return (
    <div className="flex items-start gap-4">
      <span className="text-xs text-gray-500 w-8 shrink-0 whitespace-nowrap pt-1">
        {locale}
      </span>
      <LocaleTextarea
        value={stringValue}
        placeholder="<empty>"
        onChange={(v) => store.setField(currentLocalePath, v)}
      />
    </div>
  );
};

const formatNewlines = (str: string): string => {
  return str.replace(/\n/g, '↵ ');
};

const formatPreviewValue = (value: unknown, pluralized: boolean): string => {
  if (pluralized) {
    const plural = value as PluralValue | undefined;
    if (!plural) return '';
    return `${formatNewlines(plural.one)} / ${formatNewlines(plural.other)}`;
  }
  return formatNewlines(String(value ?? ''));
};

const StringPreview = ({
  valuePath,
  pluralized,
}: {
  valuePath: string;
  pluralized: boolean;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const locales = useReadStoreField(store, 'locales');

  const currentLocaleValuePath =
    `localeValues.${selectedLocale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocaleValuePath);
  const dropdown = useInputFocusDropdownState(false);

  useListenKeyboard(
    {
      Escape: (event) => {
        event.preventDefault();
        dropdown.closeWithFocusBackToInput();
      },
    },
    dropdown.open,
  );

  return (
    <div className="flex grow justify-end">
      <div className="w-full max-w-[500px] relative">
        <Dropdown
          {...dropdown.dropdownProps}
          trigger={({ ref }) => (
            <div ref={ref}>
              <MinimalistInput
                value={formatPreviewValue(value, pluralized)}
                placeholder="<empty>"
                readOnly
                active={dropdown.open}
                {...dropdown.inputProps}
                className="cursor-pointer"
              />
            </div>
          )}
        >
          {({ ref, style }) => (
            <FocusLock returnFocus={false}>
              <div
                ref={ref}
                style={style}
                className="absolute top-full right-0 w-[400px] p-3 bg-popover border rounded-md shadow-md z-50"
              >
                <div className="flex flex-col gap-2">
                  {(locales as string[]).map((locale) => (
                    <LocaleInput
                      key={locale}
                      locale={locale}
                      valuePath={valuePath}
                      pluralized={pluralized}
                    />
                  ))}
                </div>
              </div>
            </FocusLock>
          )}
        </Dropdown>
      </div>
    </div>
  );
};

export const SchemaStringField = ({
  fieldPath,
  valuePath,
}: {
  fieldPath: PathToField;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const pluralized = useReadStoreField(
    store,
    `${fieldPath}.type.pluralized` as const,
  );

  return (
    <BaseField
      icon={<TypeIcon className="text-gray-500" size={16} />}
      fieldPath={fieldPath}
      valuePath={valuePath}
      valuesPreview={({ valuePath }) => (
        <StringPreview valuePath={valuePath} pluralized={!!pluralized} />
      )}
    />
  );
};
