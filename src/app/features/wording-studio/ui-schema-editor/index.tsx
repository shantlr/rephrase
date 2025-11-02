import { Button } from '@/app/common/ui/button';
import { Input } from '@/app/common/ui/input';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { nanoid } from 'nanoid';
import { SchemaNode } from '@/server/data/wording.types';
import { SchemaObjectFieldsList } from './field-object';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';
import { StudioContext } from './studio-context';
import { useSchemaSearch } from '../use-project-wording-form';
import { useEffect, useState } from 'react';

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

export const SchemaEditor = () => {
  const store = useWordingStudioStore();

  return (
    <StudioContext>
      <div className="w-full px-2 flex flex-col space-y-6">
        {/* Fields */}
        <div className="w-full flex flex-col ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wordings</h3>
            <div className="flex items-center gap-4">
              <SearchInput />
              <SelectLocale />
            </div>
          </div>

          <SchemaObjectFieldsList
            pathToFieldList="schema.root.fields"
            wordingEditable
            depth={0}
          />
          <div className="py-2 text-center group/end-add">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 opacity-40 group-hover/end-add:opacity-100 transition-opacity"
              onClick={() => {
                const newField = {
                  id: nanoid(),
                  type: 'string-template',
                } satisfies SchemaNode;

                store?.setField(`schema.nodes.${newField.id}`, newField);
                store?.setField('schema.root.fields', (prev) => [
                  ...prev,
                  {
                    name: '',
                    typeId: newField.id,
                  },
                ]);
              }}
            >
              <PlusIcon className="w-3 h-3 mr-2" />
              Add field
            </Button>
          </div>
        </div>
      </div>
    </StudioContext>
  );
};
