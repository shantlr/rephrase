import * as ts from 'typescript';

export interface ParsedData {
  rootValues: {
    name: string | undefined;
    value: unknown;
  }[];
}

export interface ParameterWarning {
  path: string;
  originalFormat: string;
  convertedFormat: string;
}

/**
 * Auto-detect and parse content (JSON or TypeScript)
 */
export function parseContent(content: string): ParsedData {
  // First try JSON parsing (faster and more reliable for pure JSON)
  try {
    const data = JSON.parse(content);
    return {
      rootValues: [data],
    };
  } catch {
    // If JSON parsing fails, try TypeScript parsing
    return parseTypeScript(content);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stringifyTsNode = (node: ts.Node, indent = 0): string => {
  let current = `${ts.SyntaxKind[node.kind]}`;
  if (ts.isIdentifier(node)) {
    current += ` (${node.text})`;
  }
  const res = [`${' '.repeat(indent)}- ${current}`];
  node.forEachChild((child) => {
    res.push(stringifyTsNode(child, indent + 2));
  });
  return res.join('\n');
};

/**
 * Parse TypeScript content using TypeScript compiler API
 */
function parseTypeScript(content: string): ParsedData {
  try {
    // Create a source file from the content
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    const rootValues: {
      name: string | undefined;
      value: unknown;
    }[] = [];

    // for Debugging
    // console.log(stringifyTree(sourceFile));

    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node)) {
        const name = node.name.getText();
        if (node.initializer) {
          const value = extractValue(node.initializer);
          rootValues.push({
            name,
            value,
          });
        }
        return;
      }

      // For other nodes, continue traversing
      node.forEachChild(visit);
    };

    visit(sourceFile);
    return { rootValues };
  } catch (error) {
    throw new Error(
      `Invalid TypeScript: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Extract object literal from TypeScript AST node
 */
function extractObjectLiteral(
  node: ts.ObjectLiteralExpression,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const prop of node.properties) {
    if (ts.isPropertyAssignment(prop)) {
      let key: string;

      // Get the property key
      if (ts.isIdentifier(prop.name)) {
        key = prop.name.text;
      } else if (ts.isStringLiteral(prop.name)) {
        key = prop.name.text;
      } else {
        continue; // Skip computed properties for now
      }

      // Get the property value
      result[key] = extractValue(prop.initializer);
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      // Handle shorthand: { value } instead of { value: value }
      const key = prop.name.text;
      result[key] = prop.name.text; // This is simplified
    }
    // Skip spread assignments and method declarations for now
  }

  return result;
}

/**
 * Extract value from TypeScript AST node
 */
function extractValue(node: ts.Node): unknown {
  if (ts.isStringLiteral(node)) {
    return node.text;
  } else if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  } else if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  } else if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => {
      if (ts.isSpreadElement(element)) return null; // Skip spread elements
      return extractValue(element);
    });
  } else if (ts.isObjectLiteralExpression(node)) {
    return extractObjectLiteral(node);
  } else if (ts.isTemplateExpression(node)) {
    // Handle template literals: `Hello ${name}`
    let result = node.head.text;
    for (const span of node.templateSpans) {
      result += '${...}'; // Placeholder for expressions
      result += span.literal.text;
    }
    return result;
  } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
    // Handle simple template literals: `Hello world`
    return node.text;
  }

  // For unsupported node types, return a placeholder
  // return '[Unsupported value]';
  return undefined;
}
