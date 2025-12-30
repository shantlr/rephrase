import { Button } from '@/app/common/ui/button';
import { Badge } from '@/app/common/ui/badge';
import { Check, ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';
import { useStudioStore } from '../../store';
import { useReadStoreField } from '../../../wording-studio/store';
import { useImportAssign } from './use-import-assign';
import { ConfirmImportModal } from '../ui-confirm-import-modal';
import { ImportState } from '../types';

interface ImportPanelProps {
  selectedLocale: string;
  locales: string[];
}

// Format assigned path for display (show plural part indicator)
const formatAssignedPath = (path: string): string => {
  if (path.endsWith('.one')) {
    return `${path.replace('.one', '')} (one)`;
  }
  if (path.endsWith('.other')) {
    return `${path.replace('.other', '')} (other)`;
  }
  return path;
};

export function ImportPanel({ selectedLocale, locales }: ImportPanelProps) {
  const store = useStudioStore();
  const importState = useReadStoreField(store, 'importWording');

  const { applyAllAssignments, getCurrentValue } = useImportAssign();

  // Only render when in assigning or confirming step
  if (importState.step !== 'assigning' && importState.step !== 'confirming') {
    return null;
  }

  const isConfirming = importState.step === 'confirming';
  const wordings = importState.wordings;
  const pendingAssignments = importState.pendingAssignments;
  const selectedWordingIndex =
    importState.step === 'assigning' ? importState.selectedWordingIndex : null;
  const isPanelMinimized =
    importState.step === 'assigning' ? importState.isPanelMinimized : false;

  const updateAssigningState = (
    updates: Partial<Extract<ImportState, { step: 'assigning' }>>,
  ) => {
    if (importState.step !== 'assigning') {
      return;
    }
    store.setField('importWording', { ...importState, ...updates });
  };

  const handleSelectWording = (index: number | null) => {
    updateAssigningState({ selectedWordingIndex: index });
  };

  const handleTogglePanelMinimized = () => {
    updateAssigningState({ isPanelMinimized: !isPanelMinimized });
  };

  const handleCancelAssignment = () => {
    store.setField('importWording', { step: 'idle' });
  };

  const handleUnassignWording = (wordingIndex: number) => {
    if (importState.step !== 'assigning') {
      return;
    }

    const newWordings = [...wordings];
    if (newWordings[wordingIndex]) {
      newWordings[wordingIndex] = {
        ...newWordings[wordingIndex],
        assignedTo: null,
      };
    }

    const newPendingAssignments = pendingAssignments.filter(
      (pa) => pa.wordingIndex !== wordingIndex,
    );

    updateAssigningState({
      wordings: newWordings,
      pendingAssignments: newPendingAssignments,
    });
  };

  const handleReviewChanges = () => {
    // Transition to confirming step
    store.setField('importWording', {
      step: 'confirming',
      wordings,
      pendingAssignments,
    });
  };

  const handleCancelConfirm = () => {
    // Go back to assigning step
    store.setField('importWording', {
      step: 'assigning',
      wordings,
      selectedWordingIndex: null,
      isPanelMinimized: false,
      pendingAssignments,
    });
  };

  const handleConfirmApply = () => {
    applyAllAssignments();
  };

  const assignedCount = wordings.filter((w) => w.assignedTo !== null).length;

  return (
    <div
      className={cn(
        'fixed right-4 top-24 w-80 bg-white border rounded-lg shadow-lg z-40 transition-all',
        isPanelMinimized && 'w-auto',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
          {isPanelMinimized && selectedWordingIndex !== null ? (
            <span className="text-sm font-medium text-blue-700 truncate">
              {wordings[selectedWordingIndex]?.values[selectedLocale] ||
                Object.values(
                  wordings[selectedWordingIndex]?.values || {},
                )[0] ||
                '(empty)'}
            </span>
          ) : (
            <>
              <span className="font-medium text-sm">Import Wordings</span>
              <Badge variant="secondary" className="text-xs">
                {assignedCount}/{wordings.length}
              </Badge>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleTogglePanelMinimized}
          >
            {isPanelMinimized ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCancelAssignment}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isPanelMinimized && (
        <>
          <div className="max-h-96 overflow-auto p-2 space-y-1">
            {wordings.map((wording, index) => {
              const isSelected = selectedWordingIndex === index;
              const isAssigned = wording.assignedTo !== null;
              const displayValue =
                wording.values[selectedLocale] ||
                Object.values(wording.values)[0] ||
                '';

              return (
                <div
                  key={wording.id}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
                    isSelected && 'bg-blue-100 border border-blue-300',
                    isAssigned &&
                      !isSelected &&
                      'bg-green-50 hover:bg-green-100',
                    !isSelected && !isAssigned && 'hover:bg-gray-100',
                  )}
                  onClick={() => {
                    // Allow selecting any wording, including already assigned ones (for reassignment)
                    handleSelectWording(isSelected ? null : index);
                  }}
                >
                  <div className="shrink-0 w-5">
                    {isAssigned ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-xs text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        isAssigned && 'text-green-700',
                      )}
                      title={displayValue}
                    >
                      {displayValue || '(empty)'}
                    </p>
                    {isAssigned && wording.assignedTo && (
                      <p className="text-xs text-green-600 truncate">
                        → {formatAssignedPath(wording.assignedTo)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(wording.values).length} lang
                    </Badge>
                    {isAssigned && (
                      <button
                        className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignWording(index);
                        }}
                        title="Remove assignment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-gray-50 rounded-b-lg">
            {pendingAssignments.length > 0 ? (
              <Button className="w-full" onClick={handleReviewChanges}>
                <Check className="w-4 h-4 mr-2" />
                Review Changes ({pendingAssignments.length})
              </Button>
            ) : (
              <p className="text-xs text-center text-gray-500">
                Click a wording, then click a field to assign
              </p>
            )}
          </div>
        </>
      )}

      {/* Confirm Import Modal */}
      <ConfirmImportModal
        open={isConfirming}
        onConfirm={handleConfirmApply}
        onCancel={handleCancelConfirm}
        pendingAssignments={pendingAssignments}
        locales={locales}
        getCurrentValue={getCurrentValue}
      />
    </div>
  );
}
