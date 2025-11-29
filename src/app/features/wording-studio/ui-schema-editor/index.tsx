import { Button } from '@/app/common/ui/button';
import { Input } from '@/app/common/ui/input';
import { PlusIcon, SearchIcon, XIcon, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { SchemaObjectFieldsList } from './field-object';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';
import { StudioContext, useStudio } from './studio-context';
import { useSchemaSearch } from '../use-project-wording-form';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ImportWordingValuesDialog } from '../ui-import-wording-values';
import { useImportWordingValues } from '../use-import-wording-values';

const SelectLocale = () => {
  const store = useWordingStudioStore();

  const locales = useReadStoreField(store, 'locales');
  const selectedLocale = useReadStoreField(store, 'selectedLocale');

  if (!locales.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Preview values for:</span>
      <Select
        value={selectedLocale || ''}
        onValueChange={(value) => {
          store?.setField('selectedLocale', value);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select locale" />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const SearchInput = () => {
  const store = useWordingStudioStore();
  const { searchQuery, setSearchQuery } = useSchemaSearch(store);
  const [localValue, setLocalValue] = useState(searchQuery);

  // Simple debounced sync: localValue → store (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue, setSearchQuery]);

  const handleChange = (value: string) => {
    setLocalValue(value);
  };

  const handleClear = () => {
    setLocalValue('');
  };

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search fields..."
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9 pr-9 w-64"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          onClick={handleClear}
        >
          <XIcon className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

const AppendFieldButton = () => {
  const store = useWordingStudioStore();
  const studio = useStudio();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
      onClick={() => {
        const paths = store?.getField('schema.pathToFieldList');
        const lastPath = paths?.[paths.length - 1];
        if (lastPath) {
          flushSync(() => {
            studio.appendItem(lastPath);
          });
          studio.focusNextInput(lastPath);
          return;
        }
      }}
    >
      <PlusIcon className="w-3 h-3 mr-2" />
      Add field
    </Button>
  );
};

const ImportButton = ({ onImportClick }: { onImportClick: () => void }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onImportClick}
      title="Import wording values from JSON or TypeScript"
    >
      <Download className="w-4 h-4 mr-2" />
      Import Values
    </Button>
  );
};
export const SchemaEditor = () => {
  const store = useWordingStudioStore();
  const schema = useReadStoreField(store, 'schema');
  const locales = useReadStoreField(store, 'locales');

  const importState = useImportWordingValues(
    schema,
    locales,
    async (instances, locale, strategy) => {
      // Apply the imported instances to the store
      for (const [nodeId, nodeInstances] of Object.entries(instances)) {
        const currentInstances =
          store?.getField('schema.nodes' as const)[nodeId]?.instances || {};

        const mergedInstances: Record<string, unknown> = {
          ...currentInstances,
        };

        if (strategy === 'overwrite') {
          // Overwrite: replace the instances for this locale
          for (const [instLocale, instValue] of Object.entries(nodeInstances)) {
            mergedInstances[instLocale] = instValue;
          }
        } else {
          // Merge: only update what's in the new data
          for (const [instLocale, instValue] of Object.entries(nodeInstances)) {
            if (instLocale === locale) {
              mergedInstances[instLocale] = instValue;
            }
          }
        }

        // Use setFieldFromPath to handle dynamic node IDs
        store?.setFieldFromPath(
          ['schema', 'nodes', nodeId, 'instances'] as unknown as Parameters<
            typeof store.setFieldFromPath
          >[0],
          mergedInstances,
        );
      }

      // Add locale if it doesn't exist
      if (!locales.includes(locale)) {
        store?.setField('locales', [...locales, locale]);
      }
    },
  );

  return (
    <StudioContext>
      <div className="w-full px-2 flex flex-col space-y-6">
        {/* Fields */}
        <div className="w-full flex flex-col ">
          <div className="pt-2 sticky top-0 z-40 bg-white border-b border-gray-200 pb-4 mb-4 px-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Wordings</h3>
              <div className="flex items-center gap-4">
                <SearchInput />
                <SelectLocale />
                <ImportButton
                  onImportClick={() => importState.setIsOpen(true)}
                />
              </div>
            </div>
          </div>

          <SchemaObjectFieldsList
            parentField={undefined}
            pathToFieldList="schema.root.fields"
            wordingEditable
            depth={0}
          />
          <div className="py-2 text-center group/end-add">
            <AppendFieldButton />
          </div>
        </div>

        <ImportWordingValuesDialog
          isOpen={importState.isOpen}
          onOpenChange={importState.setIsOpen}
          availableLocales={locales}
          state={importState}
        />
      </div>
    </StudioContext>
  );
};
