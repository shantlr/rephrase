import {
  SchemaNode,
  SchemaObjectNode,
  WordingData,
} from '@/server/data/wording.types';
import { isEqual, map, sortBy } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createStore, useReadStoreField } from './store';
import { WordingStudioStore } from './ui-wording-studio-context';
import { extractParams } from './ui-schema-editor/_util-extract-params';

/**
 * Build a searchable index of all fields in the schema
 */
const buildSearchableFields = (
  schema: FormValues['schema'],
): SearchableField[] => {
  const searchableFields: SearchableField[] = [];

  const traverseFields = (
    fields: SchemaObjectNode['fields'],
    pathPrefix: string,
    depth: number,
  ) => {
    fields.forEach((field, index) => {
      const fieldPath = `${pathPrefix}.${index}` as PathToField;

      searchableFields.push({
        path: fieldPath,
        name: field.name || '',
        depth,
      });

      const fieldType = schema.nodes[field.typeId];
      if (fieldType?.type === 'object') {
        // For nested object fields, we need to traverse through the type's fields
        // but maintain the path structure that connects to the parent field
        const nestedPathPrefix = `schema.nodes.${fieldType.id}.fields`;
        traverseFields(fieldType.fields, nestedPathPrefix, depth + 1);
      } else if (fieldType?.type === 'array') {
        const itemType = schema.nodes[fieldType.itemTypeId];
        if (itemType?.type === 'object') {
          // For array item object fields, similar approach
          const nestedPathPrefix = `schema.nodes.${itemType.id}.fields`;
          traverseFields(itemType.fields, nestedPathPrefix, depth + 1);
        }
      }
    });
  };

  traverseFields(schema.root.fields, 'schema.root.fields', 0);
  return searchableFields;
};

/**
 * Build maps for field hierarchy navigation
 */
const buildFieldHierarchy = (
  schema: FormValues['schema'],
): {
  parentMap: Map<string, string[]>; // child -> [parent1, parent2, ...]
  childrenMap: Map<string, string[]>; // parent -> [child1, child2, ...]
} => {
  const parentMap = new Map<string, string[]>();
  const childrenMap = new Map<string, string[]>();

  const traverseAndMap = (
    fields: SchemaObjectNode['fields'],
    pathPrefix: string,
    parentPaths: string[] = [],
  ) => {
    fields.forEach((field, index) => {
      const fieldPath = `${pathPrefix}.${index}`;

      // Map child to parents
      parentMap.set(fieldPath, [...parentPaths]);

      // Map parents to this child
      parentPaths.forEach((parentPath) => {
        const existingChildren = childrenMap.get(parentPath) || [];
        childrenMap.set(parentPath, [...existingChildren, fieldPath]);
      });

      const fieldType = schema.nodes[field.typeId];
      if (fieldType?.type === 'object') {
        const nestedPathPrefix = `schema.nodes.${fieldType.id}.fields`;
        traverseAndMap(fieldType.fields, nestedPathPrefix, [
          ...parentPaths,
          fieldPath,
        ]);
      } else if (fieldType?.type === 'array') {
        const itemType = schema.nodes[fieldType.itemTypeId];
        if (itemType?.type === 'object') {
          const nestedPathPrefix = `schema.nodes.${itemType.id}.fields`;
          traverseAndMap(itemType.fields, nestedPathPrefix, [
            ...parentPaths,
            fieldPath,
          ]);
        }
      }
    });
  };

  traverseAndMap(schema.root.fields, 'schema.root.fields');
  return { parentMap, childrenMap };
};

/**
 * Recursively add all descendants of a field path to the visible set
 */
const addAllDescendants = (
  fieldPath: string,
  childrenMap: Map<string, string[]>,
  visiblePaths: Set<string>,
): void => {
  const children = childrenMap.get(fieldPath) || [];
  children.forEach((childPath) => {
    visiblePaths.add(childPath);
    // Recursively add descendants of this child
    addAllDescendants(childPath, childrenMap, visiblePaths);
  });
};

/**
 * Filter searchable fields based on search query and return visible field paths
 */
const getVisibleFieldPaths = (
  searchableFields: SearchableField[],
  searchQuery: string,
  schema: FormValues['schema'],
): Set<string> => {
  if (!searchQuery.trim()) {
    // If no search query, all fields are visible
    return new Set(searchableFields.map((field) => field.path));
  }

  const query = searchQuery.toLowerCase().trim();
  const visiblePaths = new Set<string>();
  const { parentMap, childrenMap } = buildFieldHierarchy(schema);

  // Find fields that match the search query
  const matchingFields = searchableFields.filter((field) =>
    field.name.toLowerCase().includes(query),
  );

  // Add matching fields, their ancestors, and their descendants
  matchingFields.forEach((field) => {
    visiblePaths.add(field.path);

    // Add all parent paths (ancestors)
    const parentPaths = parentMap.get(field.path) || [];
    parentPaths.forEach((parentPath) => {
      visiblePaths.add(parentPath);
    });

    // Add all descendant paths (children and nested children)
    addAllDescendants(field.path, childrenMap, visiblePaths);
  });

  return visiblePaths;
};

export type PathToType = `schema.nodes.${string}`;
export type PathToRootFieldList = `schema.root.fields`;
export type PathToFieldList = `${PathToType}.fields` | PathToRootFieldList;

export type PathToArrayItemTypeId = `${PathToType}.itemTypeId`;

export type PathToField = `${PathToFieldList}.${number}`;

export type PathToWordingInstanceValue =
  | `${PathToType}.instances.${string}`
  | `${PathToField}.instances.${string}`;

export type SearchableField = {
  path: PathToField;
  name: string;
  depth: number;
};

export type FormValues = {
  constants: WordingData['constants'];
  schema: {
    nodes: Record<string, SchemaNode>;
    root: WordingData['schema']['root'];
  };
  selectedLocale: string | null;
  locales: string[];
  searchQuery: string;
  searchableFields: SearchableField[];
  visibleFieldPaths: Set<string>;
};

export const useProjectWordingForm = ({
  initialValues: inputInitialValues,
}: {
  initialValues?: Partial<FormValues>;
}) => {
  const initialSchema = useMemo(() => {
    const baseSchema = inputInitialValues?.schema ?? {
      nodes: {} as Record<string, SchemaNode>,
      root: {
        id: 'root',
        type: 'object',
        fields: [],
      } as WordingData['schema']['root'],
    };

    const flattenPathToField = (
      node: SchemaObjectNode,
      pathToType: PathToType | `schema.root`,
    ) => {
      const res: PathToField[] = [];
      node.fields.forEach((field, index) => {
        const path: PathToField = `${pathToType}.fields.${index}`;
        res.push(path);
        const fieldType = baseSchema.nodes[field.typeId];
        if (fieldType?.type === 'object') {
          res.push(
            ...flattenPathToField(fieldType, `schema.nodes.${fieldType.id}`),
          );
        } else if (fieldType?.type === 'array') {
          const itemType = baseSchema.nodes[fieldType.itemTypeId];
          if (itemType?.type === 'object') {
            res.push(
              ...flattenPathToField(itemType, `schema.nodes.${itemType.id}`),
            );
          }
        }
      });

      return res;
    };

    return {
      ...baseSchema,
      pathToFieldList: flattenPathToField(baseSchema.root, 'schema.root'),
    };
  }, [inputInitialValues]);

  const [store] = useState(() =>
    createStore({
      constants: inputInitialValues?.constants ?? [],
      schema: initialSchema,
      locales: inputInitialValues?.locales ?? [],
      selectedLocale: inputInitialValues?.locales?.[0] ?? null,
      searchQuery: '',
      searchableFields: [],
      visibleFieldPaths: new Set<string>(),
    }),
  );

  // Update searchable fields when schema changes
  useEffect(() => {
    const updateSearchableFields = () => {
      const currentSchema = store.getField('schema');
      const searchableFields = buildSearchableFields(currentSchema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (store as any).setField('searchableFields', searchableFields);

      // Update visible paths based on current search query
      const currentSearchQuery = store.getField('searchQuery');
      const visiblePaths = getVisibleFieldPaths(
        searchableFields,
        currentSearchQuery,
        currentSchema,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (store as any).setField('visibleFieldPaths', visiblePaths);
    };

    // Initial build
    updateSearchableFields();

    // Listen for schema changes
    const unsubscribe = store.subscribeKey('schema', updateSearchableFields);
    return unsubscribe;
  }, [store]);

  return {
    store,
  };
};

/**
 * Hook to manage search functionality
 */
export const useSchemaSearch = (store: WordingStudioStore | null) => {
  const searchQuery = useReadStoreField(store, 'searchQuery');
  const searchableFields = useReadStoreField(store, 'searchableFields');
  const schema = useReadStoreField(store, 'schema');

  // Update visible paths when search query changes
  useEffect(() => {
    if (!store || !searchableFields.length) return;

    const visiblePaths = getVisibleFieldPaths(
      searchableFields,
      searchQuery,
      schema,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store as any).setField('visibleFieldPaths', visiblePaths);
  }, [store, searchQuery, searchableFields, schema]);

  const setSearchQuery = (query: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store as any)?.setField('searchQuery', query);
  };

  return {
    searchQuery,
    setSearchQuery,
  };
};

/**
 * Handle field name that contains params
 * Compute all possible field name
 */
export const useObjectFieldNamePossibilities = ({
  store,
  pathToField,
}: {
  store: WordingStudioStore | null;
  pathToField: PathToField;
}) => {
  const template = useReadStoreField(store, `${pathToField}.name`) ?? '';
  const params = useReadStoreField(store, `${pathToField}.params`);

  const constants = useReadStoreField(store, 'constants');

  return useMemo(() => {
    const compute = (
      temp: string,
      leftParams: {
        name: string;
        def: NonNullable<typeof params>[string];
      }[],
    ): string[] => {
      if (!leftParams.length) {
        return [temp];
      }

      const [p, ...others] = leftParams;
      if (p.def.type === 'constant') {
        const constant = constants.find((c) => c.name === p.def.name);
        if (!constant) {
          // not found, should not trigger warn in that case
          return [];
        }

        if (constant?.type === 'enum') {
          return constant.options.flatMap((option) => {
            const nextTemp = template.replaceAll(`{${p.name}}`, option);
            return compute(nextTemp, others);
          });
        }
      }
      console.warn(`Unhandled param`, p);
      return [];
    };

    return compute(
      template,
      map(params, (p, name) => ({
        name,
        def: p,
      })),
    );
  }, [constants, template, params]);
};

export function useSyncParamsFromTemplate<
  Params extends Record<string, unknown>,
>({
  template,
  currentParams,
  defaultParam,
  onSync,
}: {
  template: string | undefined;
  currentParams: Params | undefined;
  defaultParam: () => NoInfer<Params[string]>;
  onSync: (params: Params | undefined) => void;
}) {
  const ref = useRef({ onSync, defaultParam });
  ref.current.onSync = onSync;
  ref.current.defaultParam = defaultParam;

  useEffect(() => {
    const check = () => {
      const extractedParams = extractParams(template || '');
      console.log('>>', extractedParams);
      if (!extractedParams.length) {
        // no params
        if (currentParams) {
          ref.current.onSync?.(undefined);
        }
      } else if (
        (Object.keys(currentParams || {}).length ?? 0) !==
          extractedParams.length ||
        !isEqual(
          sortBy(Object.keys(currentParams || {})),
          sortBy(extractedParams),
        )
      ) {
        const nextParams: typeof currentParams = {} as Params;
        extractedParams.forEach((p) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          nextParams[p] = currentParams?.[p] ?? ref.current.defaultParam();
        });
        ref.current.onSync?.(nextParams);
      }
    };

    const id = requestIdleCallback(() => {
      check();
    });
    return () => {
      cancelIdleCallback(id);
    };
  }, [template, currentParams]);
}
