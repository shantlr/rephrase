import { Alert, AlertDescription } from '@/app/common/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { ValidationError } from '../map-values-to-instances';

export interface ImportPreviewStepProps {
  previewStructure: unknown;
  previewStats: { nodeCount: number; fieldCount: number };
  validationErrors: ValidationError[];
  warnings: string[];
}

function PreviewNode({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}): React.ReactNode {
  const indent = depth * 16;

  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>;
  }

  if (typeof value === 'string') {
    return (
      <span className="text-green-600 break-words">
        &quot;{value.length > 80 ? value.substring(0, 80) + '...' : value}&quot;
      </span>
    );
  }

  if (typeof value === 'number') {
    return <span className="text-blue-600">{value}</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-purple-600">{value ? 'true' : 'false'}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="text-gray-600">[</span>
        {value.length > 0 && (
          <div className="pl-4 space-y-1">
            {value.slice(0, 5).map((item, i) => (
              <div key={i}>
                <PreviewNode value={item} depth={depth + 1} />
              </div>
            ))}
            {value.length > 5 && (
              <div className="text-gray-500 text-sm">
                ... and {value.length - 5} more items
              </div>
            )}
          </div>
        )}
        <span className="text-gray-600">]</span>
      </div>
    );
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj).slice(0, 10);

    return (
      <div style={{ marginLeft: indent }}>
        <span className="text-gray-600">{'{'}</span>
        {entries.length > 0 && (
          <div className="pl-4 space-y-1">
            {entries.map(([key, val]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-orange-600 font-mono">{key}:</span>
                <div className="min-w-0">
                  <PreviewNode value={val} depth={0} />
                </div>
              </div>
            ))}
            {Object.keys(obj).length > 10 && (
              <div className="text-gray-500 text-sm">
                ... and {Object.keys(obj).length - 10} more fields
              </div>
            )}
          </div>
        )}
        <span className="text-gray-600">{'}'}</span>
      </div>
    );
  }

  return <span className="text-gray-400">&lt;{typeof value}&gt;</span>;
}

export function ImportPreviewStep({
  previewStructure,
  previewStats,
  validationErrors,
  warnings,
}: ImportPreviewStepProps) {
  return (
    <div className="space-y-4">
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

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 max-h-80 overflow-y-auto">
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
              <strong>💡 Tip:</strong> Go back and check your data format. Make
              sure the structure matches what the schema expects. All type
              mismatches must be fixed before you can proceed.
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Import Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">
              Schema Nodes
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {previewStats.nodeCount}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-green-600 font-medium">
              Object Fields
            </div>
            <div className="text-2xl font-bold text-green-700">
              {previewStats.fieldCount}
            </div>
          </div>
        </div>
        {warnings.length > 0 && (
          <p className="text-xs text-amber-700 mt-3 px-3 py-2 bg-amber-50 rounded border border-amber-200">
            ℹ️ Partial import detected - {warnings.length} field(s) will not be
            updated
          </p>
        )}
      </div>

      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">{warnings.length} Warning(s)</div>
            <ul className="text-xs space-y-1 mt-2">
              {warnings.slice(0, 3).map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
              {warnings.length > 3 && (
                <li>... and {warnings.length - 3} more warnings</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Data Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-auto max-h-64 font-mono text-sm">
          <PreviewNode value={previewStructure} />
        </div>
      </div>
    </div>
  );
}
