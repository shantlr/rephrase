import { useReadStoreField } from '../wording-studio/store';
import { useStudioStore } from './store';
import { PathToField } from './types';

/**
 * Hook to check if a field should be visible based on the current search.
 * Returns true if no search is active (visibleFields is null) or if the
 * field path is in the visible set.
 */
export const useFieldVisible = (fieldPath: PathToField): boolean => {
  const store = useStudioStore();
  const visibleFields = useReadStoreField(
    store,
    'visibleFields',
  ) as Set<string> | null;

  // null = show all (no search active)
  if (visibleFields === null) return true;

  return visibleFields.has(fieldPath);
};
