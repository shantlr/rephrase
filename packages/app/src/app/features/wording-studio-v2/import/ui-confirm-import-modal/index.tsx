import { Button } from '@/app/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/common/ui/dialog';
import { AssignmentInfo } from '../types';

// Format value for display (truncate if too long)
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '(empty)';
  }
  const str = String(value);
  if (str.length > 50) {
    return str.slice(0, 50) + '...';
  }
  return str || '(empty)';
};

// Format path for display (show plural part indicator)
const formatPath = (path: string): string => {
  if (path.endsWith('.one')) {
    return `${path.replace('.one', '')} (one)`;
  }
  if (path.endsWith('.other')) {
    return `${path.replace('.other', '')} (other)`;
  }
  return path;
};

export function ConfirmImportModal({
  open,
  onConfirm,
  onCancel,
  assignedValuesMap,
  locales,
  getCurrentValue,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  assignedValuesMap: Record<string, AssignmentInfo>;
  locales: string[];
  getCurrentValue: (locale: string, valuePath: string) => unknown;
}) {
  const assignments = Object.entries(assignedValuesMap);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Import Changes</DialogTitle>
          <DialogDescription>
            The following changes will be applied to your wording values.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-700">
                  Field
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-700">
                  Locale
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-700">
                  Current
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-700">
                  New
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.flatMap(([valuePath, assignment]) =>
                locales.map((locale) => {
                  const currentValue = getCurrentValue(locale, valuePath);
                  const newValue = assignment.values[locale];

                  // Skip if no new value for this locale
                  if (!newValue) {
                    return null;
                  }

                  const hasChange =
                    formatValue(currentValue) !== formatValue(newValue);

                  return (
                    <tr
                      key={`${valuePath}-${locale}`}
                      className={hasChange ? 'bg-green-50' : ''}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">
                        {formatPath(valuePath)}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{locale}</td>
                      <td className="px-3 py-2">
                        {currentValue ? (
                          <span
                            className={
                              hasChange
                                ? 'text-red-600 line-through'
                                : 'text-gray-500'
                            }
                            title={String(currentValue)}
                          >
                            {formatValue(currentValue)}
                          </span>
                        ) : (
                          <span className="text-gray-400">(empty)</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={hasChange ? 'text-green-700' : ''}
                          title={newValue}
                        >
                          {formatValue(newValue)}
                        </span>
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Apply {assignments.length} Change
            {assignments.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
