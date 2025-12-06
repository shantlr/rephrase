import {
  SchemaNode,
  SchemaObjectNode,
  SchemaStringTemplateNode,
  SchemaArrayNode,
  SchemaNumberNode,
  SchemaBooleanNode,
  WordingData,
} from '@/server/data/wording.types';
import { isPlainObject } from 'lodash-es';

export interface ValidationError {
  path: string;
  error: string;
}

export interface MappingResult {
  instances: Record<string, Record<string, unknown>>; // nodeId -> instances dict
  validationErrors: ValidationError[];
  warnings: string[];
}

/**
 * Maps parsed values from imported data to schema node instances
 * Validates that the structure matches the existing schema
 */
export function mapParsedValuesToInstances(
  parsedValue: unknown,
  schema: WordingData['schema'],
  locale: string,
): MappingResult {
  const instances: Record<string, Record<string, unknown>> = {};
  const validationErrors: ValidationError[] = [];
  const warnings: string[] = [];

  // Start mapping from root
  const rootNode = schema.root;
  mapNode(
    parsedValue,
    rootNode,
    schema.nodes,
    instances,
    validationErrors,
    warnings,
    locale,
    '',
  );

  return { instances, validationErrors, warnings };
}

function mapNode(
  value: unknown,
  node: SchemaNode,
  allNodes: Record<string, SchemaNode>,
  instances: Record<string, Record<string, unknown>>,
  errors: ValidationError[],
  warnings: string[],
  locale: string,
  path: string,
): void {
  // Initialize instances dict for this node if not exists
  if (!instances[node.id]) {
    instances[node.id] = {};
  }

  const currentPath = path || node.type;

  switch (node.type) {
    case 'string-template': {
      const strNode = node as SchemaStringTemplateNode;
      if (typeof value !== 'string' && !isPlainObject(value)) {
        errors.push({
          path: currentPath,
          error: `Expected ${strNode.variant === 'pluralized' ? 'object with "one"/"other" or string' : 'string'}, got ${typeof value}`,
        });
        return;
      }

      if (strNode.variant === 'pluralized') {
        // For pluralized, expect object with 'one' and 'other'
        if (!isPlainObject(value)) {
          errors.push({
            path: currentPath,
            error:
              'This field uses pluralization. Provide an object like: { "one": "1 item", "other": "{count} items" }',
          });
          return;
        }
        const pluralObj = value as unknown as Record<string, unknown>;
        const pluralValue: Record<string, string> = {};
        if (typeof pluralObj.one === 'string') {
          pluralValue.one = pluralObj.one;
        } else {
          errors.push({
            path: `${currentPath}.one`,
            error: `The "one" key must be a string, got ${typeof pluralObj.one}`,
          });
        }
        if (typeof pluralObj.other === 'string') {
          pluralValue.other = pluralObj.other;
        } else {
          errors.push({
            path: `${currentPath}.other`,
            error: `The "other" key must be a string, got ${typeof pluralObj.other}`,
          });
        }
        if (Object.keys(pluralValue).length === 2) {
          if (!instances[strNode.id]) {
            instances[strNode.id] = {};
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (instances[strNode.id] as any)[locale] = pluralValue;
        }
      } else {
        // Regular string template
        if (!instances[strNode.id]) {
          instances[strNode.id] = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (instances[strNode.id] as any)[locale] = value;
      }
      break;
    }

    case 'number': {
      const numNode = node as SchemaNumberNode;
      if (typeof value !== 'number') {
        errors.push({
          path: currentPath,
          error: `This field expects a number (e.g., 42), but got ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}`,
        });
        return;
      }
      if (!instances[numNode.id]) {
        instances[numNode.id] = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (instances[numNode.id] as any)[locale] = value;
      break;
    }

    case 'boolean': {
      const boolNode = node as SchemaBooleanNode;
      if (typeof value !== 'boolean') {
        errors.push({
          path: currentPath,
          error: `This field expects true or false, but got ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}`,
        });
        return;
      }
      if (!instances[boolNode.id]) {
        instances[boolNode.id] = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (instances[boolNode.id] as any)[locale] = value;
      break;
    }

    case 'array': {
      const arrNode = node as SchemaArrayNode;
      if (!Array.isArray(value)) {
        errors.push({
          path: currentPath,
          error: `This field expects an array (e.g., ["item1", "item2"]), but got ${typeof value}`,
        });
        return;
      }

      if (!instances[arrNode.id]) {
        instances[arrNode.id] = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (instances[arrNode.id] as any)[locale] = value;

      // Also validate items against the item schema if we want stricter validation
      // For now, we just store the array as-is
      break;
    }

    case 'object': {
      const objNode = node as SchemaObjectNode;
      if (!isPlainObject(value)) {
        errors.push({
          path: currentPath,
          error: `Expected an object (e.g., { "key": "value" }), but got ${typeof value}`,
        });
        return;
      }

      const objValue = value as Record<string, unknown>;
      const instanceValue: Record<string, unknown> = {};

      for (const field of objNode.fields) {
        const fieldValue = objValue[field.name];

        if (fieldValue === undefined) {
          warnings.push(
            `Missing field "${field.name}" at ${currentPath} - this field will not be updated`,
          );
          continue;
        }

        const fieldTypeNode = allNodes[field.typeId];
        if (!fieldTypeNode) {
          errors.push({
            path: `${currentPath}.${field.name}`,
            error: `Schema configuration error: type not found for field "${field.name}"`,
          });
          continue;
        }

        // Map the field value recursively
        mapNode(
          fieldValue,
          fieldTypeNode,
          allNodes,
          instances,
          errors,
          warnings,
          locale,
          `${currentPath}.${field.name}`,
        );

        // For object fields, we need to store the field value
        // Check if this field has params (it might store instance values)
        if (field.instances) {
          if (!field.instances[locale]) {
            field.instances[locale] = {};
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (field.instances[locale] as any)[field.name] = fieldValue;
        }

        instanceValue[field.name] = fieldValue;
      }

      // Note: SchemaObjectNode root doesn't have instances field directly,
      // instances are stored on individual fields instead
      break;
    }
  }
}

/**
 * Create a preview structure showing what will be imported
 */
export function createImportPreview(
  value: unknown,
  schema: WordingData['schema'],
): {
  structure: unknown;
  nodeCount: number;
  fieldCount: number;
} {
  let nodeCount = 0;
  let fieldCount = 0;

  function countStructure(v: unknown, node: SchemaNode): unknown {
    nodeCount++;
    if (node.type === 'object') {
      const objNode = node as SchemaObjectNode;
      const result: Record<string, unknown> = {};
      if (isPlainObject(v)) {
        const objValue = v as Record<string, unknown>;
        for (const field of objNode.fields) {
          fieldCount++;
          const fieldValue = objValue[field.name];
          const fieldTypeNode = schema.nodes[field.typeId];
          if (fieldTypeNode && fieldValue !== undefined) {
            result[field.name] = countStructure(fieldValue, fieldTypeNode);
          }
        }
      }
      return result;
    }
    if (node.type === 'array' && Array.isArray(v)) {
      const arrNode = node as SchemaArrayNode;
      const itemNode = schema.nodes[arrNode.itemTypeId];
      return v.map((item) =>
        itemNode ? countStructure(item, itemNode) : item,
      );
    }
    return `<${node.type}>`;
  }

  const structure = countStructure(value, schema.root);
  return { structure, nodeCount, fieldCount };
}
