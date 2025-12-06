import {
  ColumnType,
  Generated,
  GeneratedAlways,
  JSONColumnType,
  Selectable,
} from 'kysely';
import { WordingData } from './wording.types';
import { AccountTable, UserSession, UserTable } from './user.types';

export interface Database {
  project: Project;
  project_wording_branch: ProjectWordingBranchTable;
  project_wording_branch_operation: ProjectWordingBranchOperation;
  project_wording_audit_log: ProjectWordingAuditLog;

  user: UserTable;
  account: AccountTable;
  user_session: UserSession;
}

export interface Project {
  id: GeneratedAlways<string>;
  name: string;
  description: string;
  created_at: GeneratedAlways<Date>;
  updated_at: ColumnType<Date, string | undefined, never>;
  archived_at: ColumnType<Date | null, Date | null, Date | null>;
}

export interface ProjectWordingBranchTable {
  id: GeneratedAlways<string>;
  project_id: ColumnType<string, string, never>;
  name: string;

  /**
   * Once locked a branch cannot be updated anymore
   */
  locked: boolean;

  /**
   * Current hash of data
   */
  hash: string;

  /**
   * Data contain full state of the wordings
   */
  data: JSONColumnType<WordingData>;

  created_at: GeneratedAlways<Date>;
  updated_at: Generated<Date>;

  archived_at: Date | null;
}
export type ProjectWordingBranch = Selectable<ProjectWordingBranchTable>;

/**
 * We log branch operation to be able to do diff/merge and retrace graph
 */
export interface ProjectWordingBranchOperation {
  id: GeneratedAlways<string>;

  project_id: ColumnType<string, string, never>;

  source_branch_id: ColumnType<string, string, never>;
  target_branch_id: ColumnType<string, string, never>;

  data: JSONColumnType<
    | {
        type: 'create_branch';
        source_data: WordingData;
      }
    | {
        type: 'merge_branch';
        merged_result_data: WordingData;
      }
  >;

  created_at: GeneratedAlways<Date>;
}

/**
 * Audit logs of what happend on wordings
 */
export interface ProjectWordingAuditLog {
  id: GeneratedAlways<string>;
  project_id: ColumnType<string, string, never>;
  branch_id: ColumnType<string, string, never>;
  user_id: ColumnType<string, string, never>;
  data: JSONColumnType<
    | {
        type: 'update_wording_branch';
        branching_operation_id: string;
      }
    | {
        type: 'create_wording_branch';
        branching_operation_id: string;
      }
  >;
  created_at: GeneratedAlways<Date>;
}
