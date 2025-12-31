export interface ImportedWording {
  id: string;
  values: Record<string, string>; // locale -> value
  assignedTo: string | null; // field path when assigned (e.g., "buttonLabel" or "buttonLabel.one" for plural parts)
}

// Single source of truth: valuePath -> assignment info
export interface AssignmentInfo {
  wordingIndex: number;
  values: Record<string, string>; // locale -> value
}

// Import flow state machine
export type ImportState =
  | { step: 'idle' }
  | {
      step: 'parsing';
      parsedTable: string[][] | null;
      parseError: string | null;
      columnLanguages: string[];
      isTransposed: boolean;
    }
  | {
      step: 'assigning';
      wordings: ImportedWording[];
      selectedWordingIndex: number | null;
      isPanelMinimized: boolean;
      assignedValuesMap: Record<string, AssignmentInfo>; // valuePath → assignment info (single source of truth)
    }
  | {
      step: 'confirming';
      wordings: ImportedWording[];
      assignedValuesMap: Record<string, AssignmentInfo>; // valuePath → assignment info (single source of truth)
    };
