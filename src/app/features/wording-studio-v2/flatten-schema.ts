import {
  type SchemaNode,
  SchemaObjectNode,
  SchemaStringTemplateNode,
  WordingData,
  WordingEnumConstant,
} from '@/server/data/wording.types';

export type LocaleValues = Record<string, Record<string, unknown>>;

export type FlattenedWordingItem = {
  /** Unique identifier for rendering; based on path + template key if any */
  id: string;
  /** Human friendly path using dot notation */
  path: string;
  /** Field label (uses template expansion when applicable) */
  label: string;
  /** Depth in the tree for indentation */
  depth: number;
  /** Target node information */
  nodeId: string;
  nodeType: SchemaNode['type'];
  variant?: SchemaStringTemplateNode['variant'];
  /** When the field has params, the concrete expanded key */
  templateKey?: string;
  /** Path of indices from root.fields to reach this field */
  fieldPath: number[];
  /** True when instances are stored on the field (template params) */
  usesFieldInstances: boolean;
};

type FieldParam = NonNullable<SchemaObjectNode['fields'][number]['params']>;

const computePossibleNames = (
  template: string,
  params: FieldParam,
  constants: WordingData['constants'],
): string[] => {
  const paramEntries = Object.entries(params);
  if (!paramEntries.length) return [template];

  const enumConstantsByName = new Map(
    constants
      .filter((c): c is WordingEnumConstant => c.type === 'enum')
      .map((c) => [c.name, c]),
  );

  const expand = (
    currentTemplate: string,
    remaining: typeof paramEntries,
  ): string[] => {
    if (!remaining.length) return [currentTemplate];
    const [[name, def], ...rest] = remaining;
    if (def.type !== 'constant') return expand(currentTemplate, rest);

    const constant = enumConstantsByName.get(def.name);
    if (!constant) return expand(currentTemplate, rest);

    return constant.options.flatMap((option) => {
      const nextTemplate = currentTemplate.replaceAll(`{${name}}`, option);
      return expand(nextTemplate, rest);
    });
  };

  return expand(template, paramEntries);
};

export const flattenSchema = (
  schema: WordingData['schema'],
  constants: WordingData['constants'],
): FlattenedWordingItem[] => {
  const items: FlattenedWordingItem[] = [];

  const traverse = (
    fields: SchemaObjectNode['fields'],
    pathSegments: string[],
    fieldPath: number[],
  ) => {
    fields.forEach((field, index) => {
      const node = schema.nodes[field.typeId];
      if (!node) return;

      const nextFieldPath = [...fieldPath, index];
      const nextPathSegments = [...pathSegments, field.name];

      if (node.type === 'object') {
        traverse(node.fields, nextPathSegments, nextFieldPath);
        return;
      }

      const hasParams = !!field.params;
      const expandedNames = hasParams
        ? computePossibleNames(field.name, field.params!, constants)
        : [];
      const concreteNames = expandedNames.length ? expandedNames : [field.name];

      concreteNames.forEach((label) => {
        const path = [...pathSegments, label].join('.');
        items.push({
          id: `${path}${hasParams ? `::${label}` : ''}`,
          path,
          label,
          depth: pathSegments.length,
          nodeId: node.id,
          nodeType: node.type,
          variant: node.type === 'string-template' ? node.variant : undefined,
          templateKey: hasParams ? label : undefined,
          fieldPath: nextFieldPath,
          usesFieldInstances: hasParams,
        });
      });
    });
  };

  traverse(schema.root.fields, [], []);

  return items;
};

export const getItemValue = (
  localeValues: LocaleValues,
  item: FlattenedWordingItem,
  locale: string,
): unknown => localeValues?.[locale]?.[item.id];

// V2: only store values under locales.values (no schema instances writes)

export const setItemValue = (
  schema: WordingData['schema'],
  localeValues: LocaleValues,
  item: FlattenedWordingItem,
  locale: string,
  value: unknown,
): { schema: WordingData['schema']; localeValues: LocaleValues } => {
  const nextLocaleValues = structuredClone(localeValues ?? {});
  const currentLocaleValues = nextLocaleValues[locale] || {};
  nextLocaleValues[locale] = {
    ...currentLocaleValues,
    [item.id]: value,
  } as Record<string, unknown>;

  return { schema, localeValues: nextLocaleValues };
};
