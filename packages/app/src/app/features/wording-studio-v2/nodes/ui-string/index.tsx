import { TypeIcon } from 'lucide-react';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { useStudioStore } from '../../store';
import { useReadStoreField } from '@/app/features/wording-studio/store';
import { MinimalistInput } from '@/app/features/wording-studio/ui-schema-editor/_minimalist-input';
import { useEffect, useRef, useState } from 'react';

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
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8 shrink-0 uppercase">
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
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && selectedInputRef.current) {
      selectedInputRef.current.focus();
    }
  }, [isOpen]);

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is still within our container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="flex grow justify-end"
      ref={containerRef}
      onBlur={handleBlur}
    >
      <div className="w-full max-w-[500px] relative">
        <MinimalistInput
          value={String(value ?? '')}
          placeholder="<empty>"
          readOnly
          onFocus={() => setIsOpen(true)}
          className="cursor-pointer"
        />
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-[400px] p-3 bg-popover border rounded-md shadow-md z-50">
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
        )}
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
