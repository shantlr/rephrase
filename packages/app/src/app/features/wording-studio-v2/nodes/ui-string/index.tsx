import { TypeIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';

import { Dropdown } from '@/app/common/ui/dropdown';
import { useReadStoreField } from '@/app/features/wording-studio/store';
import { MinimalistInput } from '@/app/features/wording-studio/ui-schema-editor/_minimalist-input';

import { useStudioStore } from '../../store';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';

const LocaleInput = ({
  locale,
  valuePath,
  inputRef,
}: {
  locale: string;
  valuePath: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const store = useStudioStore();
  const currentLocalePath = `localeValues.${locale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocalePath);

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-gray-500 w-8 shrink-0 whitespace-nowrap">
        {locale}
      </span>
      <MinimalistInput
        ref={inputRef}
        value={String(value ?? '')}
        placeholder="<empty>"
        onChange={(e) => {
          store.setField(currentLocalePath, e.target.value);
        }}
      />
    </div>
  );
};

const StringPreview = ({ valuePath }: { valuePath: string }) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const locales = useReadStoreField(store, 'locales');

  const currentLocaleValuePath =
    `localeValues.${selectedLocale}.${valuePath}` as const;
  const value = useReadStoreField(store, currentLocaleValuePath);
  const [isOpen, setIsOpen] = useState(false);
  const selectedInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex grow justify-end">
      <div className="w-full max-w-[500px] relative">
        <Dropdown
          trigger={({ ref, onClick }) => (
            <div ref={ref}>
              <MinimalistInput
                value={String(value ?? '')}
                placeholder="<empty>"
                readOnly
                onClick={onClick}
                className="cursor-pointer"
              />
            </div>
          )}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          {({ ref, style }) => (
            <FocusLock returnFocus>
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
                      inputRef={
                        locale === selectedLocale ? selectedInputRef : undefined
                      }
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
  return (
    <BaseField
      icon={<TypeIcon className="text-gray-500" size={16} />}
      fieldPath={fieldPath}
      valuesPreview={<StringPreview valuePath={valuePath} />}
    />
  );
};
