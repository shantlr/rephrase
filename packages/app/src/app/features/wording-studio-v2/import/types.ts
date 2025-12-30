export interface ImportedWording {
  id: string;
  values: Record<string, string>; // locale -> value
  assignedTo: string | null; // field path when assigned (e.g., "buttonLabel" or "buttonLabel.one" for plural parts)
}

export interface PendingAssignment {
  wordingIndex: number;
  valuePath: string; // e.g., "buttonLabel" or "buttonLabel.one" for plural parts
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
      pendingAssignments: PendingAssignment[];
    }
  | {
      step: 'confirming';
      wordings: ImportedWording[];
      pendingAssignments: PendingAssignment[];
    };
