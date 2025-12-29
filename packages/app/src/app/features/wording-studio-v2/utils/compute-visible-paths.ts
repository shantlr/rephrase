import {
  SchemaObjectNode,
  SchemaObjectNodeField,
} from '@/server/data/wording.types';
import { matchesSearch } from './normalize-text';
import { ExpandedNameInfo } from './compute-expanded-names';

/**
 * Computes the set of visible field paths based on search query.
 * When a field matches, all its descendants are also included.
 * Uses pre-computed expanded names for templated fields (e.g., "button_{action}" → ["button_click", ...]).
 */
export const computeVisiblePaths = (
  schema: SchemaObjectNode,
  search: string,
  expandedFieldNames: Map<string, ExpandedNameInfo[]>,
): Set<string> => {
  const visible = new Set<string>();

  const addAllDescendants = (
    fields: SchemaObjectNodeField[],
    basePath: string,
  ) => {
    fields.forEach((field, index) => {
      const fieldPath = `${basePath}.${index}`;
      visible.add(fieldPath);

      if (field.type.type === 'object' && field.type.fields) {
        addAllDescendants(field.type.fields, `${fieldPath}.type.fields`);
      }
    });
  };

  const traverse = (
    fields: SchemaObjectNodeField[],
    basePath: string,
    ancestorMatched: boolean,
  ) => {
    fields.forEach((field, index) => {
      const fieldPath = `${basePath}.${index}`;
      // Use pre-computed expanded names for matching
      const expandedNames = expandedFieldNames.get(fieldPath) ?? [
        { name: field.name, paramValues: {} },
      ];
      const selfMatches = expandedNames.some((info) =>
        matchesSearch(info.name, search),
      );

      if (ancestorMatched) {
        // Ancestor matched, add this and all descendants
        visible.add(fieldPath);
        if (field.type.type === 'object' && field.type.fields) {
          addAllDescendants(field.type.fields, `${fieldPath}.type.fields`);
        }
      } else if (selfMatches) {
        // This field matches, add it and all descendants
        visible.add(fieldPath);
        if (field.type.type === 'object' && field.type.fields) {
          addAllDescendants(field.type.fields, `${fieldPath}.type.fields`);
        }
      } else {
        // No match yet, continue traversing to find matching descendants
        if (field.type.type === 'object' && field.type.fields) {
          const prevSize = visible.size;
          traverse(field.type.fields, `${fieldPath}.type.fields`, false);
          // If any descendant was added, we need to show this field too
          if (visible.size > prevSize) {
            visible.add(fieldPath);
          }
        }
      }
    });
  };

  traverse(schema.fields, 'schema.fields', false);
  return visible;
};
