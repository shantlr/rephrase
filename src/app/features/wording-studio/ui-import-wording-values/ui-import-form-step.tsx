import { Button } from '@/app/common/ui/button';
import { Textarea } from '@/app/common/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Alert, AlertDescription } from '@/app/common/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ValidationError } from '../map-values-to-instances';

export interface ImportFormStepProps {
  content: string;
  setContent: (content: string) => void;
  selectedLocale: string;
  setSelectedLocale: (locale: string) => void;
  availableLocales: string[];
  isLoading: boolean;
  error: string | null;
  parseSuccess: boolean;
  validationErrors: ValidationError[];
  onParse: () => Promise<void>;
}

export function ImportFormStep({
  content,
  setContent,
  selectedLocale,
  setSelectedLocale,
  availableLocales,
  isLoading,
  error,
  parseSuccess,
  validationErrors,
  onParse,
}: ImportFormStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Target Locale</label>
        <Select value={selectedLocale} onValueChange={setSelectedLocale}>
          <SelectTrigger>
            <SelectValue placeholder="Select a locale" />
          </SelectTrigger>
          <SelectContent>
            {availableLocales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                {locale}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose which locale the imported values will be assigned to
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Paste JSON or TypeScript</label>
        <Textarea
          placeholder={`Paste your wording data here. Examples:

JSON:
{
  "hello": "Hello World",
  "welcome": "Welcome {name}"
}

TypeScript:
const messages = {
  hello: "Hello World",
  welcome: "Welcome {name}"
}
`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-64 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Supports JSON objects, arrays, and TypeScript variable declarations
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">
                {validationErrors.length} Validation Error(s) Found
              </div>
              <p className="text-xs mt-1">
                Please fix the following issues before importing:
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="space-y-1 pb-3 border-b border-red-100 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-2">
                  <div className="text-red-600 font-semibold text-sm flex-shrink-0">
                    {i + 1}.
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-700 break-all">
                      {err.path}
                    </div>
                    <p className="text-sm text-red-900 mt-1">{err.error}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>💡 Tip:</strong> Fix the data format above and try parsing
              again. Make sure the structure matches what the schema expects.
            </p>
          </div>
        </div>
      )}

      {parseSuccess && !validationErrors.length && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✓ Content parsed successfully. Click &quot;Parse and Preview&quot;
            to proceed.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={onParse}
        disabled={!content.trim() || !selectedLocale || isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Parsing...' : 'Parse and Preview'}
      </Button>
    </div>
  );
}
