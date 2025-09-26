import {
  SchemaNode,
  SchemaObjectNode,
  SchemaStringTemplateNode,
  SchemaArrayNode,
  SchemaNumberNode,
  SchemaBooleanNode,
} from '@/server/data/wording.types';
import { isPlainObject } from 'lodash-es';
import { nanoid } from 'nanoid';

export function inferSchemaFromValue(value: unknown) {
  if (Array.isArray(value)) {
    return inferArraySchemaFromValue(value);
  } else if (isPlainObject(value)) {
    return inferObjectSchemaFromValue(value as Record<string, unknown>);
  } else if (typeof value === 'string') {
    return inferStringTemplateNodeFromValue(value);
  } else if (typeof value === 'number') {
    return inferNumberNodeFromValue();
  } else if (typeof value === 'boolean') {
    return inferBooleanNodeFromValue();
  }

  return null;
}

const inferStringTemplateNodeFromValue = (str: string) => {
  const node: SchemaStringTemplateNode = {
    id: nanoid(),
    type: 'string-template',
  };

  const params = extractParameters(str);
  if (Object.keys(params).length > 0) {
    node.params = params;
  }

  return {
    nodes: {
      [node.id]: node,
    } as Record<string, SchemaNode>,
    rootId: node.id,
  };
};

const inferNumberNodeFromValue = () => {
  const node: SchemaNumberNode = {
    id: nanoid(),
    type: 'number',
  };

  return {
    nodes: {
      [node.id]: node,
    } as Record<string, SchemaNode>,
    rootId: node.id,
  };
};

const inferBooleanNodeFromValue = () => {
  const node: SchemaBooleanNode = {
    id: nanoid(),
    type: 'boolean',
  };

  return {
    nodes: {
      [node.id]: node,
    } as Record<string, SchemaNode>,
    rootId: node.id,
  };
};

const inferArraySchemaFromValue = (arr: unknown[]) => {
  const rootArray: SchemaArrayNode = {
    id: nanoid(),
    type: 'array',
    itemTypeId: '',
  };
  const res = {
    nodes: {
      [rootArray.id]: rootArray,
    } as Record<string, SchemaNode>,
    rootId: rootArray.id,
  };

  if (arr.length > 0) {
    const firstItem = arr[0];
    const itemNode = inferSchemaFromValue(firstItem);
    if (itemNode) {
      Object.assign(res.nodes, itemNode.nodes);
      rootArray.itemTypeId = itemNode.rootId;
    }
  }

  if (!rootArray.itemTypeId) {
    const defaultItemNode: SchemaStringTemplateNode = {
      id: nanoid(),
      type: 'string-template',
    };
    res.nodes[defaultItemNode.id] = defaultItemNode;
    rootArray.itemTypeId = defaultItemNode.id;
  }

  return {
    nodes: res.nodes,
    rootId: rootArray.id,
  };
};

const inferObjectSchemaFromValue = (obj: Record<string, unknown>) => {
  const rootObject: SchemaObjectNode = {
    id: nanoid(),
    type: 'object',
    fields: [],
  };

  const res = {
    nodes: {
      [rootObject.id]: rootObject,
    } as Record<string, SchemaNode>,
    rootId: rootObject.id,
  };

  for (const [key, val] of Object.entries(obj)) {
    const fieldNode = inferSchemaFromValue(val);
    if (fieldNode) {
      Object.assign(res.nodes, fieldNode.nodes);
      rootObject.fields.push({
        name: key,
        typeId: fieldNode.rootId,
      });
    }
  }
  return res;
};

/**
 * Extract parameters from a string template
 */
function extractParameters(str: string): {
  [paramName: string]: { type: 'string' };
} {
  const params: { [paramName: string]: { type: 'string' } } = {};
  const paramPattern = /\{([^}]+)\}/g;
  let match;

  while ((match = paramPattern.exec(str)) !== null) {
    const paramName = match[1];
    params[paramName] = { type: 'string' };
  }

  return params;
}
