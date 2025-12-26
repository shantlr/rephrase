import { TypeIcon, CodeXml } from 'lucide-react';
import FocusLock from 'react-focus-lock';
import Editor from '@monaco-editor/react';

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

const HtmlLocaleInput = ({
  locale,
  valuePath,
}: {
  locale: string;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const currentLocalePath = `localeValues.${locale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocalePath);
  const stringValue = String(value ?? '');

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{locale}</span>
      <div className="border border-gray-200 rounded overflow-hidden">
        <Editor
          height="150px"
          language="html"
          value={stringValue}
          onChange={(v) => store.setField(currentLocalePath, v ?? '')}
          theme="light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineNumbers: 'off',
            wordWrap: 'on',
            folding: false,
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
            },
          }}
        />
      </div>
    </div>
  );
};

const formatNewlines = (str: string): string => {
  return str.replace(/\n/g, '↵ ');
};

export const formatStringPreview = (
  value: unknown,
  pluralized: boolean,
  html?: boolean,
): string => {
  if (pluralized) {
    const plural = value as PluralValue | undefined;
    if (!plural) return '';
    return `${formatNewlines(plural.one)} / ${formatNewlines(plural.other)}`;
  }
  const str = String(value ?? '');
  if (html) {
    // Show raw HTML, truncate if too long
    const truncated = str.length > 80 ? str.slice(0, 80) + '...' : str;
    return truncated.replace(/\n/g, ' ');
  }
  return formatNewlines(str);
};

const StringPreview = ({
  valuePath,
  pluralized,
  html,
}: {
  valuePath: string;
  pluralized: boolean;
  html?: boolean;
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
                value={formatStringPreview(value, pluralized, html)}
                placeholder="<empty>"
                readOnly
                active={dropdown.open}
                {...dropdown.inputProps}
                className={
                  html ? 'cursor-pointer font-mono text-xs' : 'cursor-pointer'
                }
              />
            </div>
          )}
        >
          {({ ref, style }) => (
            <FocusLock returnFocus={false}>
              <div
                ref={ref}
                style={style}
                className={`absolute top-full right-0 p-3 bg-popover border rounded-md shadow-md z-50 ${html ? 'w-[600px]' : 'w-[400px]'}`}
              >
                <div className="flex flex-col gap-2">
                  {(locales as string[]).map((locale) =>
                    html ? (
                      <HtmlLocaleInput
                        key={locale}
                        locale={locale}
                        valuePath={valuePath}
                      />
                    ) : (
                      <LocaleInput
                        key={locale}
                        locale={locale}
                        valuePath={valuePath}
                        pluralized={pluralized}
                      />
                    ),
                  )}
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
  const html = useReadStoreField(store, `${fieldPath}.type.html` as const);

  const icon = html ? (
    <CodeXml className="text-gray-500" size={16} />
  ) : (
    <TypeIcon className="text-gray-500" size={16} />
  );

  return (
    <BaseField
      icon={icon}
      fieldPath={fieldPath}
      valuePath={valuePath}
      valuesPreview={({ valuePath }) => (
        <StringPreview
          valuePath={valuePath}
          pluralized={!!pluralized}
          html={!!html}
        />
      )}
    />
  );
};
