import { TypeIcon, CodeXml } from 'lucide-react';
import FocusLock from 'react-focus-lock';
import Editor from '@monaco-editor/react';

import { Dropdown } from '@/app/common/ui/dropdown';
import { useReadStoreField } from '@/app/features/wording-studio/store';
import { MinimalistInput } from '@/app/features/wording-studio/ui-schema-editor/_minimalist-input';
import { cn } from '@/app/common/lib/utils';

import { useStudioStore } from '../../store';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { useListenKeyboard } from '@/app/common/hooks/use-listen-keyboard';
import { useInputFocusDropdownState } from '@/app/common/hooks/use-input-focus-dropdown-state';
import { useImportAssign } from '../../import/ui-assign-panel/use-import-assign';

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
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-start gap-2">
          <span className="text-xs text-gray-400 w-10 shrink-0 pt-1">one</span>
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
    );
  }

  const stringValue = String(value ?? '');

  return (
    <LocaleTextarea
      value={stringValue}
      placeholder="<empty>"
      onChange={(v) => store.setField(currentLocalePath, v)}
    />
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
  );
};

export const StringLocaleInputField = ({
  locale,
  valuePath,
  html,
  pluralized,
}: {
  locale: string;
  valuePath: string;
  html: boolean;
  pluralized: boolean;
}) => {
  if (html) {
    return <HtmlLocaleInput locale={locale} valuePath={valuePath} />;
  }
  return (
    <LocaleInput
      locale={locale}
      valuePath={valuePath}
      pluralized={pluralized}
    />
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
    if (!plural) {
      return '';
    }
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
                className={`w-full absolute top-full left-0 p-3 bg-popover border rounded-md shadow-md z-50 ${html ? 'w-[600px]' : 'w-[400px]'}`}
              >
                <div className="flex flex-col gap-3">
                  {(locales as string[]).map((locale) => (
                    <div key={locale} className="flex items-start gap-4">
                      <span className="text-xs text-gray-500 w-8 shrink-0 pt-1.5 whitespace-nowrap">
                        {locale}
                      </span>
                      <div className="flex-1">
                        <StringLocaleInputField
                          locale={locale}
                          valuePath={valuePath}
                          html={!!html}
                          pluralized={pluralized}
                        />
                      </div>
                    </div>
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

// Component for showing separate "one" and "other" targets during import mode
const PluralizedImportTargets = ({
  valuePath,
  handleAssign,
}: {
  valuePath: string;
  handleAssign: (path: string) => void;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');

  const currentLocaleValuePath =
    `localeValues.${selectedLocale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocaleValuePath) as
    | PluralValue
    | undefined;

  const oneValue = value?.one || '';
  const otherValue = value?.other || '';

  return (
    <div className="flex flex-col gap-1 flex-1">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 ring-2 ring-blue-200 ring-inset rounded px-2 py-1.5 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleAssign(`${valuePath}.one`);
        }}
      >
        <span className="text-xs text-gray-400 w-10 shrink-0">one</span>
        <span className="text-sm text-gray-600 truncate flex-1">
          {oneValue || <span className="text-gray-400">Click to assign</span>}
        </span>
      </div>
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 ring-2 ring-blue-200 ring-inset rounded px-2 py-1.5 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleAssign(`${valuePath}.other`);
        }}
      >
        <span className="text-xs text-gray-400 w-10 shrink-0">other</span>
        <span className="text-sm text-gray-600 truncate flex-1">
          {otherValue || <span className="text-gray-400">Click to assign</span>}
        </span>
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
  const { isAssigning, isSelecting, handleAssign } = useImportAssign();

  const icon = html ? (
    <CodeXml className="text-gray-500" size={16} />
  ) : (
    <TypeIcon className="text-gray-500" size={16} />
  );

  const handleClick = () => {
    if (isSelecting && !pluralized) {
      // Only handle click for non-pluralized strings
      // Pluralized strings have their own click targets
      handleAssign(valuePath);
    }
  };

  // For pluralized strings in import mode, show separate targets for "one" and "other"
  if (pluralized && isAssigning) {
    return (
      <BaseField
        icon={icon}
        fieldPath={fieldPath}
        valuePath={valuePath}
        valuesPreview={() => (
          <PluralizedImportTargets
            valuePath={valuePath}
            handleAssign={handleAssign}
          />
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'transition-colors rounded',
        isSelecting &&
          'cursor-pointer hover:bg-blue-50 ring-2 ring-blue-200 ring-inset',
      )}
      onClick={handleClick}
    >
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
    </div>
  );
};
