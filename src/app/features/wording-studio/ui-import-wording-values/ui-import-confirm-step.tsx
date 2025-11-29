import { Button } from '@/app/common/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Alert, AlertDescription } from '@/app/common/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { OverwriteStrategy } from '../use-import-wording-values';

export interface ImportConfirmStepProps {
  selectedLocale: string;
  overwriteStrategy: OverwriteStrategy;
  setOverwriteStrategy: (strategy: OverwriteStrategy) => void;
  previewStats: { nodeCount: number; fieldCount: number };
  isLoading: boolean;
  onImport: () => Promise<void>;
  onCancel: () => void;
}

export function ImportConfirmStep({
  selectedLocale,
  overwriteStrategy,
  setOverwriteStrategy,
  previewStats,
  isLoading,
  onImport,
  onCancel,
}: ImportConfirmStepProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <div className="font-medium mb-1">Ready to import</div>
          <div className="text-sm space-y-1">
            <div>
              • <strong>Locale:</strong> {selectedLocale}
            </div>
            <div>
              • <strong>Items:</strong> {previewStats.nodeCount} nodes,{' '}
              {previewStats.fieldCount} fields
            </div>
            <div>
              • <strong>Mode:</strong>{' '}
              {overwriteStrategy === 'overwrite'
                ? 'Overwrite existing values'
                : 'Merge with existing values'}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <label className="text-sm font-medium">Conflict Resolution</label>
        <Select
          value={overwriteStrategy}
          onValueChange={(value) =>
            setOverwriteStrategy(value as OverwriteStrategy)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overwrite">
              Overwrite - Replace all existing values for this locale
            </SelectItem>
            <SelectItem value="merge">
              Merge - Only update fields that are in the imported data
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {overwriteStrategy === 'overwrite'
            ? 'All existing values for this locale will be replaced with the imported data.'
            : '✓ Only the fields present in the imported data will be updated. Existing values not in the import will remain unchanged. (Recommended)'}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={onImport} disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Importing...' : 'Import Values'}
        </Button>
      </div>
    </div>
  );
}
