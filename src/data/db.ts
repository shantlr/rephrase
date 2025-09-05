import { ColumnType, Generated, JSONColumnType } from 'kysely';
import { WordingData } from './wording.types';
import { Account, Session, User, VerificationToken } from './user.types';

export interface Database {
  Project: Project;
  ProjectWordingBranch: ProjectWordingBranch;
  ProjectWordingBranchOperation: ProjectWordingBranchOperation;
  ProjectWordingAuditLog: ProjectWordingAuditLog;

  User: User;
  Account: Account;
  Session: Session;
  VerificationToken: VerificationToken;
}

export interface Project {
  id: Generated<string>;
  name: string;
  description: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
  archivedAt: ColumnType<Date | null, Date | null, Date | null>;
}

export interface ProjectWordingBranch {
  id: Generated<string>;
  projectId: ColumnType<string, string, never>;
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

  created_at: Generated<Date>;
  updated_at: Generated<Date>;

  archived_at: Date | null;
}

/**
 * We log branch operation to be able to do diff/merge and retrace graph
 */
export interface ProjectWordingBranchOperation {
  id: Generated<string>;

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

  created_at: Generated<Date>;
}

/**
 * Audit logs of what happend on wordings
 */
export interface ProjectWordingAuditLog {
  id: Generated<string>;
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
  created_at: Generated<Date>;
}
