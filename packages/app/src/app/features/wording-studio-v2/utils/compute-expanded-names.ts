import {
  SchemaObjectNode,
  SchemaObjectNodeField,
  WordingData,
  WordingEnumConstant,
} from '@/server/data/wording.types';

/**
 * Info about a single expanded name, including which param values were used.
 */
export type ExpandedNameInfo = {
  /** The fully expanded name, e.g., "button_click_primary" */
  name: string;
  /** Map of param name → { value, constantId } */
  paramValues: Record<string, { value: string; constantId: string }>;
};

/**
 * Computes all possible expanded names for a templated field.
 * E.g., "button_{action}" with action=["click","hover"] → [{ name: "button_click", paramValues: { action: { value: "click", constantId: "ACTION" } } }, ...]
 */
const expandTemplateName = (
  template: string,
  nameParams: NonNullable<SchemaObjectNodeField['nameParams']>,
  constants: WordingData['constants'],
  accumulatedParams: Record<string, { value: string; constantId: string }> = {},
): ExpandedNameInfo[] => {
  const paramEntries = Object.entries(nameParams);
  if (!paramEntries.length) {
    return [{ name: template, paramValues: accumulatedParams }];
  }

  const [paramName, paramDef] = paramEntries[0];
  const restParams = Object.fromEntries(paramEntries.slice(1));

  if (paramDef.type !== 'constant') {
    return expandTemplateName(
      template,
      restParams,
      constants,
      accumulatedParams,
    );
  }

  const constant = constants.find((c) => c.name === paramDef.id);
  if (!constant) {
    return expandTemplateName(
      template,
      restParams,
      constants,
      accumulatedParams,
    );
  }

  const values: string[] = [];
  if (constant.type === 'enum') {
    values.push(...(constant as WordingEnumConstant).options);
  } else if (constant.type === 'string') {
    values.push(constant.value);
  }

  if (!values.length) {
    return expandTemplateName(
      template,
      restParams,
      constants,
      accumulatedParams,
    );
  }

  return values.flatMap((value) => {
    const expanded = template.replaceAll(`{${paramName}}`, value);
    const newAccumulated = {
      ...accumulatedParams,
      [paramName]: { value, constantId: paramDef.id },
    };
    return Object.keys(restParams).length > 0
      ? expandTemplateName(expanded, restParams, constants, newAccumulated)
      : [{ name: expanded, paramValues: newAccumulated }];
  });
};

/**
 * Pre-computes all possible expanded names for each field in the schema.
 * Returns a Map where key is the field path (e.g., "schema.fields.0")
 * and value is an array of ExpandedNameInfo objects.
 */
export const computeAllExpandedNames = (
  schema: SchemaObjectNode,
  constants: WordingData['constants'],
): Map<string, ExpandedNameInfo[]> => {
  const result = new Map<string, ExpandedNameInfo[]>();

  const traverse = (fields: SchemaObjectNodeField[], basePath: string) => {
    fields.forEach((field, index) => {
      const fieldPath = `${basePath}.${index}`;

      // Compute expanded names for this field
      const names =
        field.nameParams && Object.keys(field.nameParams).length > 0
          ? expandTemplateName(field.name, field.nameParams, constants)
          : [{ name: field.name, paramValues: {} }];

      result.set(fieldPath, names);

      // Recurse into nested object fields
      if (field.type.type === 'object' && field.type.fields) {
        traverse(field.type.fields, `${fieldPath}.type.fields`);
      }
    });
  };

  traverse(schema.fields, 'schema.fields');
  return result;
};
