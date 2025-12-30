import { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/common/ui/dialog';
import { Button } from '@/app/common/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Alert, AlertDescription } from '@/app/common/ui/alert';
import { Input } from '@/app/common/ui/input';
import { ArrowRightLeft, AlertCircle, ClipboardPaste, X } from 'lucide-react';
import { useStudioStore } from '../../store';
import { useReadStoreField } from '../../../wording-studio/store';
import { parseClipboardContent, normalizeTable } from './parse-clipboard';
import { detectColumnLanguages } from './detect-language';
import { ImportedWording, ImportState } from '../types';

export function ImportModal() {
  const store = useStudioStore();
  const availableLocales = useReadStoreField(store, 'locales');
  const importState = useReadStoreField(store, 'importWording');

  const isOpen = importState.step === 'parsing';
  const parsedTable = isOpen ? importState.parsedTable : null;
  const parseError = isOpen ? importState.parseError : null;
  const columnLanguages = isOpen ? importState.columnLanguages : [];

  const closeModal = useCallback(() => {
    store.setField('importWording', { step: 'idle' });
  }, [store]);

  const updateParsingState = useCallback(
    (updates: Partial<Extract<ImportState, { step: 'parsing' }>>) => {
      const current = store.getField('importWording');
      if (current.step !== 'parsing') {
        return;
      }
      store.setField('importWording', { ...current, ...updates });
    },
    [store],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!isOpen) {
        return;
      }

      const text = e.clipboardData?.getData('text');
      if (!text) {
        return;
      }

      const result = parseClipboardContent(text);

      if (result.error) {
        updateParsingState({ parseError: result.error, parsedTable: null });
        return;
      }

      const normalizedTable = normalizeTable(result.table);

      // Auto-detect languages
      const detection = detectColumnLanguages(
        normalizedTable,
        availableLocales,
      );
      updateParsingState({
        parsedTable: normalizedTable,
        parseError: null,
        columnLanguages: detection.detectedLanguages,
      });
    },
    [isOpen, availableLocales, updateParsingState],
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Re-detect languages when table changes (e.g., after transpose)
  useEffect(() => {
    if (parsedTable && columnLanguages.length === 0) {
      const detection = detectColumnLanguages(parsedTable, availableLocales);
      updateParsingState({ columnLanguages: detection.detectedLanguages });
    }
  }, [
    parsedTable,
    columnLanguages.length,
    availableLocales,
    updateParsingState,
  ]);

  const canConfirm =
    parsedTable &&
    parsedTable.length > 0 &&
    columnLanguages.length > 0 &&
    columnLanguages.every((lang) => lang);

  const handleConfirm = () => {
    if (!canConfirm || !parsedTable) {
      return;
    }

    const wordings: ImportedWording[] = parsedTable.map((row, index) => {
      const values: Record<string, string> = {};
      row.forEach((cell, colIndex) => {
        const locale = columnLanguages[colIndex];
        if (locale && cell.trim()) {
          values[locale] = cell.trim();
        }
      });

      return {
        id: `import-${index}`,
        values,
        assignedTo: null,
      };
    });

    // Transition to assigning step
    store.setField('importWording', {
      step: 'assigning',
      wordings,
      selectedWordingIndex: 0,
      isPanelMinimized: false,
      pendingAssignments: [],
    });
  };

  const handleToggleTranspose = () => {
    if (!parsedTable) {
      return;
    }

    const rows = parsedTable.length;
    const cols = parsedTable[0]?.length || 0;
    const transposed: string[][] = [];

    for (let c = 0; c < cols; c++) {
      transposed[c] = [];
      for (let r = 0; r < rows; r++) {
        transposed[c][r] = parsedTable[r][c] || '';
      }
    }

    const current = store.getField('importWording');
    if (current.step !== 'parsing') {
      return;
    }

    store.setField('importWording', {
      ...current,
      parsedTable: transposed,
      isTransposed: !current.isTransposed,
      columnLanguages: [],
    });
  };

  const handleDeleteColumn = (index: number) => {
    if (!parsedTable) {
      return;
    }

    const newTable = parsedTable.map((row) => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    });

    const newLanguages = [...columnLanguages];
    newLanguages.splice(index, 1);

    updateParsingState({
      parsedTable: newTable,
      columnLanguages: newLanguages,
    });
  };

  const handleSetColumnLanguage = (index: number, language: string) => {
    const newLanguages = [...columnLanguages];
    newLanguages[index] = language;
    updateParsingState({ columnLanguages: newLanguages });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Wordings</DialogTitle>
          <DialogDescription>
            Paste content from Excel or a spreadsheet. Each row will become a
            wording to assign.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {!parsedTable && !parseError && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <ClipboardPaste className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Paste your content
              </p>
              <p className="text-sm text-gray-500 text-center">
                Copy cells from Excel or a spreadsheet and paste here (Ctrl+V /
                Cmd+V)
              </p>
            </div>
          )}

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {parsedTable && parsedTable.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {parsedTable.length} row(s), {parsedTable[0]?.length || 0}{' '}
                  column(s) detected
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleTranspose}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Switch rows/columns
                </Button>
              </div>

              <div className="border rounded-lg overflow-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {(parsedTable[0] || []).map((_, colIndex) => (
                        <th
                          key={colIndex}
                          className="px-3 py-2 text-left font-medium border-b"
                        >
                          <div className="flex items-center gap-1">
                            <Select
                              value={columnLanguages[colIndex] || ''}
                              onValueChange={(value) =>
                                handleSetColumnLanguage(colIndex, value)
                              }
                            >
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue placeholder="Language" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLocales.map((locale) => (
                                  <SelectItem key={locale} value={locale}>
                                    {locale}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteColumn(colIndex)}
                              title="Delete column"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTable.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-b-0">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2">
                            <EditableCell
                              value={cell}
                              onChange={(newValue) => {
                                if (!parsedTable) {
                                  return;
                                }
                                const newTable = [...parsedTable];
                                newTable[rowIndex] = [...newTable[rowIndex]];
                                newTable[rowIndex][cellIndex] = newValue;
                                updateParsingState({ parsedTable: newTable });
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirm & Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
    />
  );
}
