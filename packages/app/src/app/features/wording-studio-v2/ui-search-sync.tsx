import { useEffect } from 'react';
import { useReadStoreField } from '../wording-studio/store';
import { useStudioStore } from './store';
import { computeVisiblePaths } from './utils/compute-visible-paths';
import { SchemaObjectNode } from '@/server/data/wording.types';
import { ExpandedNameInfo } from './utils/compute-expanded-names';

/**
 * Syncs the search value with the visibleFields set in the store.
 * When search changes, computes which field paths should be visible.
 */
export const SearchSync = () => {
  const store = useStudioStore();
  const search = (useReadStoreField(store, 'search') as string) ?? '';
  const schema = useReadStoreField(store, 'schema') as SchemaObjectNode;
  const expandedFieldNames = useReadStoreField(
    store,
    'expandedFieldNames',
  ) as Map<string, ExpandedNameInfo[]>;

  useEffect(() => {
    if (!search) {
      store.setField('visibleFields', null);
      return;
    }

    const visiblePaths = computeVisiblePaths(
      schema,
      search,
      expandedFieldNames,
    );
    store.setField('visibleFields', visiblePaths);
  }, [search, schema, expandedFieldNames, store]);

  return null;
};
