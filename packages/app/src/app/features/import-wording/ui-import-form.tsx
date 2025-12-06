import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Button } from '@/app/common/ui/button';
import { Textarea } from '@/app/common/ui/textarea';
import { Label } from '@/app/common/ui/label';
import { Alert, AlertDescription } from '@/app/common/ui/alert';
import { UploadIcon, FileIcon, AlertTriangleIcon } from 'lucide-react';
import { useImportParser } from './use-import-parser';
import { SchemaPreview } from './ui-schema-preview';

export function ImportForm() {
  const [content, setContent] = useState('');
  const [localeTag, setLocaleTag] = useState('en-US');
  const [parseError, setParseError] = useState<string | null>(null);

  const {
    parse,
    values,
    isLoading: isParsing,
    onSelectValue,
    inferredSchema,
  } = useImportParser();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="w-5 h-5" />
            Import Master File
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste your master translation file to create the wording schema.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileIcon className="h-4 w-4" />
            <AlertDescription>
              Paste your JSON or TypeScript translation object. The format will
              be detected automatically.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="locale-tag">Locale Tag</Label>
              <input
                id="locale-tag"
                type="text"
                value={localeTag}
                onChange={(e) => setLocaleTag(e.target.value)}
                placeholder="e.g., en-US, fr-FR, it-IT"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The locale tag for the language of your import file
              </p>
            </div>

            <div>
              <Label htmlFor="content">Paste Content</Label>
              <Textarea
                id="content"
                placeholder='{\n  "common": {\n    "hello": "Hello World",\n    "welcome": "Welcome {name}"\n  }\n}\n\nor\n\nconst locale = {\n  common: {\n    hello: "Hello World",\n    welcome: "Welcome {name}"\n  }\n};'
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setParseError(null);
                }}
                className="mt-1 min-h-[200px] max-h-[400px] font-mono text-sm resize-y"
              />
            </div>

            {parseError && (
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {parseError}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!content.trim()) {
                    return;
                  }

                  setParseError(null);
                  parse(content.trim());
                }}
                disabled={!content.trim() || isParsing || !localeTag.trim()}
                className="flex-1"
              >
                {isParsing ? 'Processing...' : 'Parse & Preview'}
              </Button>
            </div>
            {(values?.length ?? 0) > 0 && (
              <div className="flex gap-2 items-center">
                <div className="text-sm">Detected Values:</div>
                {values?.map((v, index) => (
                  <Button
                    key={index}
                    size="sm"
                    onClick={() => {
                      onSelectValue(v);
                    }}
                  >
                    {v.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schema Preview */}
      {/* {parseResult ? (
        <SchemaPreview
          preview={parseResult.preview}
          parameterWarnings={parseResult.parameterWarnings}
          mappingWarnings={parseResult.mappingWarnings}
          onConfirmImport={handleConfirmImport}
          isImporting={isLoading}
        />
      ) : ( */}
      {inferredSchema ? (
        <SchemaPreview schema={inferredSchema} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Schema Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              The generated wording schema will appear here after parsing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-muted-foreground">
                No content parsed yet. Upload or paste your translation file
                above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
