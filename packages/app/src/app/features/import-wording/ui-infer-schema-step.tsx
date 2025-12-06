import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Button } from '@/app/common/ui/button';
import { Textarea } from '@/app/common/ui/textarea';
import { Label } from '@/app/common/ui/label';
import { Alert, AlertDescription } from '@/app/common/ui/alert';
import {
  UploadIcon,
  FileIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { useImportParser } from './use-import-parser';
import { SchemaPreview } from './ui-schema-preview';
import { WordingData } from '@/server/data/wording.types';

interface InferSchemaStepProps {
  onNext: (data: { schema: WordingData['schema']; localeTag: string }) => void;
  initialContent?: string;
  initialLocaleTag?: string;
}

export function InferSchemaStep({
  onNext,
  initialContent = '',
  initialLocaleTag = 'en-US',
}: InferSchemaStepProps) {
  const [content, setContent] = useState(initialContent);
  const [localeTag, setLocaleTag] = useState(initialLocaleTag);
  const [parseError, setParseError] = useState<string | null>(null);

  const {
    parse,
    values,
    isLoading: isParsing,
    onSelectValue,
    inferredSchema,
  } = useImportParser();

  const handleNext = () => {
    if (inferredSchema && localeTag.trim()) {
      onNext({
        schema: inferredSchema,
        localeTag: localeTag.trim(),
      });
    }
  };

  const canProceed = inferredSchema && localeTag.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="w-5 h-5" />
            Import Master File
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste your master translation file to infer the wording schema
            structure.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileIcon className="h-4 w-4" />
            <AlertDescription>
              Paste your JSON or TypeScript translation object. The format will
              be detected automatically, and for TypeScript files, you can
              choose which exported variable to use.
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
                placeholder={`JSON Format:
{
  "common": {
    "hello": "Hello World",
    "welcome": "Welcome {name}"
  }
}

TypeScript Format:
const locale = {
  common: {
    hello: "Hello World",
    welcome: "Welcome {name}"
  }
};`}
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
                  try {
                    parse(content.trim());
                  } catch (error) {
                    setParseError(
                      error instanceof Error
                        ? error.message
                        : 'Failed to parse content',
                    );
                  }
                }}
                disabled={!content.trim() || isParsing || !localeTag.trim()}
                className="flex-1"
              >
                {isParsing ? 'Processing...' : 'Parse & Preview Schema'}
              </Button>
            </div>

            {/* Variable Selection for TypeScript */}
            {(values?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <Label>Detected Variables (choose one):</Label>
                <div className="flex flex-wrap gap-2">
                  {values?.map((v, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectValue(v);
                      }}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the variable containing your translations
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schema Preview */}
      {inferredSchema ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              Inferred Schema Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This is the schema structure that was inferred from your content.
              You&apos;ll be able to refine it in the next step.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SchemaPreview schema={inferredSchema} />

              <div className="pt-4 border-t">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="w-full"
                >
                  Continue to Edit Schema
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Schema Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              The inferred wording schema will appear here after parsing your
              content.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-muted-foreground">
                No content parsed yet. Paste your translation file above and
                click &quot;Parse &amp; Preview Schema&quot; to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
