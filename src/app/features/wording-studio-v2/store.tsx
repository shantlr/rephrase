import { WordingData } from '@/server/data/wording.types';
import { createStore } from '../wording-studio/store';
import { createContext, useContext } from 'react';

export const createV2Store = (initialData: {
  schema: WordingData['schema'];
  localeValues: Record<string, Record<string, unknown>>;
  selectedLocale: string;
}) => {
  return createStore({
    schema: initialData.schema,
    localeValues: initialData.localeValues,
    selectedLocale: initialData.selectedLocale,
    search: '',
  });
};

const StudioStoreContext = createContext<ReturnType<
  typeof createV2Store
> | null>(null);

export const StudioStoreProvider = StudioStoreContext.Provider;

export const useStudioStore = () => {
  return useContext(StudioStoreContext)!;
};
