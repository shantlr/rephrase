import { useStudioStore } from '../../store';
import { useReadStoreField } from '../../../wording-studio/store';
import { AssignmentInfo } from '../types';

export function useImportAssign() {
  const store = useStudioStore();
  const importState = useReadStoreField(store, 'importWording');

  const isAssigning = importState.step === 'assigning';
  const selectedWordingIndex =
    importState.step === 'assigning' ? importState.selectedWordingIndex : null;
  const wordings =
    importState.step === 'assigning' || importState.step === 'confirming'
      ? importState.wordings
      : [];
  const assignedValuesMap =
    importState.step === 'assigning' || importState.step === 'confirming'
      ? importState.assignedValuesMap
      : {};

  const handleAssign = (valuePath: string) => {
    if (importState.step !== 'assigning' || selectedWordingIndex === null) {
      return;
    }

    const wording = wordings[selectedWordingIndex];
    if (!wording) {
      return;
    }

    // Update wordings with assignment
    const newWordings = [...wordings];
    newWordings[selectedWordingIndex] = {
      ...newWordings[selectedWordingIndex],
      assignedTo: valuePath,
    };

    // Remove any existing assignment for this wording (if reassigning)
    // by filtering out entries with the same wordingIndex
    const newAssignedValuesMap: Record<string, AssignmentInfo> = {};
    for (const [path, info] of Object.entries(assignedValuesMap)) {
      if (info.wordingIndex !== selectedWordingIndex) {
        newAssignedValuesMap[path] = info;
      }
    }

    // Add new assignment
    newAssignedValuesMap[valuePath] = {
      wordingIndex: selectedWordingIndex,
      values: wording.values,
    };

    // Auto-select next unassigned wording
    let nextUnassigned = newWordings.findIndex(
      (w, i) => i > selectedWordingIndex && w.assignedTo === null,
    );
    if (nextUnassigned === -1) {
      nextUnassigned = newWordings.findIndex((w) => w.assignedTo === null);
    }

    store.setField('importWording', {
      ...importState,
      wordings: newWordings,
      assignedValuesMap: newAssignedValuesMap,
      selectedWordingIndex: nextUnassigned >= 0 ? nextUnassigned : null,
    });
  };

  // Apply all assignments to the studio store
  const applyAllAssignments = () => {
    for (const [valuePath, assignment] of Object.entries(assignedValuesMap)) {
      Object.entries(assignment.values).forEach(([locale, value]) => {
        // Use setFieldFromPath for dynamic paths (including plural .one/.other)
        const path = `localeValues.${locale}.${valuePath}`.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        store.setFieldFromPath(path as any, value);
      });
    }

    // Finish assignment - reset to idle state
    store.setField('importWording', { step: 'idle' });
  };

  // Get current value for a field path and locale (for diff preview)
  const getCurrentValue = (locale: string, valuePath: string) => {
    const path = `localeValues.${locale}.${valuePath}`.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return store.getFieldFromPath(path as any);
  };

  return {
    isAssigning,
    isAssigningImportWording: isAssigning && selectedWordingIndex !== null,
    handleAssign,
    applyAllAssignments,
    assignedValuesMap,
    getCurrentValue,
  };
}
