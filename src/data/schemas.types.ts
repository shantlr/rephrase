import { ColumnType, Generated, JSONColumnType } from 'kysely';
import { WordingData } from './wording.types';
import { UserProjectRole, UserRole } from './user.types';

export interface Database {
  project: Project;
  project_wording_branch: ProjectWordingBranch;
}

export interface User {
  id: Generated<string>;
  name: string;
  email: string;

  global_roles: UserRole[];
  project_roles: JSONColumnType<
    {
      project_id: string;
      roles: UserProjectRole[];
    }[]
  >;
}

export interface Project {
  id: Generated<string>;
  name: string;
  description: string;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  archived_at: ColumnType<Date | null, Date | null, Date | null>;
}

export interface ProjectWordingBranch {
  id: Generated<string>;
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
