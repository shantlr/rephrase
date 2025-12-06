import {
  ColumnType,
  Generated,
  GeneratedAlways,
  JSONColumnType,
  Selectable,
} from 'kysely';

export type ApiTokenScope = 'read' | 'write';

export type ApiTokenResource = {
  project_id: string;
  branch_id: string | null;
  scopes: ApiTokenScope[];
};

export type ApiTokenTable = {
  id: GeneratedAlways<string>;

  /**
   * bcrypt/argon hash of the full token; plain value is never stored.
   */
  token_hash: string;

  /**
   * Human label to help identify the token (e.g. CI, staging sync).
   * Must be unique per user (name + created_by_user_id).
   */
  name: string;

  /**
   * Resources this token can access. Each entry targets a project and
   * optionally a specific branch; null branch means project-wide. Scopes are
   * defined per resource to allow mixed permissions.
   */
  resources: JSONColumnType<ApiTokenResource[]>;

  /**
   * Who created the token; useful for auditing and ownership.
   */
  created_by_user_id: ColumnType<string, string, never>;

  last_used_at: Date | null;
  expires_at: Date | null;
  revoked_at: Date | null;

  created_at: GeneratedAlways<Date>;
  updated_at: Generated<Date>;
};

export type ApiToken = Selectable<ApiTokenTable>;
