import { WordingData } from '@/server/data/wording.types';
import { createStore } from '../wording-studio/store';
import { createContext, useContext } from 'react';
import { computeAllExpandedNames } from './utils/compute-expanded-names';

export const createV2Store = (initialData: {
  schema: WordingData['schema'];
  constants: WordingData['constants'];
  locales: string[];
  localeValues: Record<string, Record<string, unknown>>;
  selectedLocale: string;
}) => {
  const expandedFieldNames = computeAllExpandedNames(
    initialData.schema,
    initialData.constants,
  );

  return createStore({
    constants: initialData.constants,
    schema: initialData.schema as Record<string, unknown>,
    locales: initialData.locales,
    localeValues: initialData.localeValues,
    selectedLocale: initialData.selectedLocale,
    search: '',
    visibleFields: null as Set<string> | null, // null = show all, Set = show only these paths
    expandedFieldNames,
  });
};

const StudioStoreContext = createContext<ReturnType<
  typeof createV2Store
> | null>(null);

export const StudioStoreProvider = StudioStoreContext.Provider;

export const useStudioStore = () => {
  return useContext(StudioStoreContext)!;
};
