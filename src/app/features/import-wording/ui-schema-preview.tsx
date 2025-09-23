import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { FileTextIcon } from 'lucide-react';
import { SchemaNode, WordingData } from '@/server/data/wording.types';

export function SchemaPreview({
  // preview,
  // parameterWarnings,
  // mappingWarnings,
  // onConfirmImport,
  // isImporting,
  schema,
}: {
  schema: WordingData['schema'];
}) {
  // const hasWarnings =
  //   parameterWarnings.length > 0 || mappingWarnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Warnings Section */}
      {/* {hasWarnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangleIcon className="w-5 h-5" />
              Import Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parameterWarnings.length > 0 && (
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Parameter Format Conversions:</p>
                    <div className="space-y-1">
                      {parameterWarnings.map((warning, index) => (
                        <div key={index} className="text-sm">
                          <code className="bg-gray-100 px-1 rounded">
                            {warning.path}
                          </code>
                          :
                          <span className="mx-2">
                            <code className="bg-red-50 text-red-700 px-1 rounded">
                              {warning.originalFormat}
                            </code>
                            {' → '}
                            <code className="bg-green-50 text-green-700 px-1 rounded">
                              {warning.convertedFormat}
                            </code>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {mappingWarnings.length > 0 && (
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Mapping Issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {mappingWarnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )} */}

      {/* Schema Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5" />
            Generated Schema Structure
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preview of the wording schema that will be created from your import.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Locales */}
            <div>
              <h4 className="font-medium mb-2">Supported Locales:</h4>
              <div className="flex gap-2">
                {/* {preview.locales?.map((locale: any) => (
                  <Badge key={locale.tag} variant="secondary">
                    {locale.tag}
                  </Badge>
                ))} */}
              </div>
            </div>

            {/* Constants */}
            {/* {preview.constants && preview.constants.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Constants:</h4>
                <div className="space-y-1">
                  {preview.constants.map((constant: any, index: number) => (
                    <div key={index} className="text-sm">
                      <Badge variant="outline">{constant.name}</Badge>
                      <span className="ml-2 text-muted-foreground">
                        {constant.type === 'enum'
                          ? `enum(${constant.options.join(', ')})`
                          : constant.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Structure Tree */}
            <div>
              <h4 className="font-medium mb-2">Structure:</h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <StructureNode nodes={schema.nodes} currentNode={schema.root} />
              </div>
            </div>

            {/* Import Button */}
            {/* {onConfirmImport && (
              <div className="pt-4 border-t">
                <Button
                  onClick={onConfirmImport}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting ? 'Importing...' : 'Confirm Import'}
                </Button>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StructureNode({
  nodes,
  currentNode,
  level = 0,
}: {
  nodes: Record<string, SchemaNode>;
  currentNode: SchemaNode;
  level?: number;
}) {
  const indent = level * 4;

  if (!currentNode) {
    return null;
  }

  if (currentNode.type === 'string-template') {
    return (
      <div style={{ paddingLeft: indent }} className="text-sm">
        <span className="text-blue-600 font-mono">string-template</span>
        {currentNode.params && Object.keys(currentNode.params).length > 0 && (
          <span className="ml-2 text-gray-500">
            params:{' '}
            {Object.keys(currentNode.params)
              .map((param) => `{${param}}`)
              .join(', ')}
          </span>
        )}
        {currentNode.instances &&
          Object.keys(currentNode.instances).length > 0 && (
            <div className="mt-1 text-xs text-gray-600">
              {Object.entries(currentNode.instances).map(([locale, value]) => (
                <div key={locale}>
                  {locale}:{' '}
                  <code className="bg-white px-1 rounded">{String(value)}</code>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  }

  if (currentNode.type === 'array') {
    return (
      <div style={{ paddingLeft: indent }} className="text-sm">
        <span className="text-green-600 font-mono">array</span>
        <span className="text-gray-500 ml-2">of:</span>
        <div className="mt-1">
          <StructureNode
            nodes={nodes}
            currentNode={nodes[currentNode.itemTypeId]}
            level={level + 1}
          />
        </div>
      </div>
    );
  }

  if (currentNode.type === 'object') {
    return (
      <div style={{ paddingLeft: indent }} className="text-sm">
        {/* <span className="text-purple-600 font-mono">object</span> */}
        <div>
          {currentNode.fields.map(({ name: fieldName, typeId }) => (
            <div key={fieldName}>
              <div
                style={{ paddingLeft: indent }}
                className="text-gray-700 font-medium"
              >
                {fieldName}:
              </div>
              {/* <div className="mt-0.5"> */}
              <StructureNode
                nodes={nodes}
                currentNode={nodes[typeId]}
                level={level + 1}
              />
              {/* </div> */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: indent }} className="text-sm text-gray-500">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      {currentNode.type || 'unknown'}
    </div>
  );
}
