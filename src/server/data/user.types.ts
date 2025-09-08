import { GeneratedAlways, JSONColumnType, Selectable } from 'kysely';

export type UserRole = 'admin' | 'default';

export type UserProjectRole = 'admin' | 'reader' | 'maintainer';

export type UserTable = {
  id: GeneratedAlways<string>;
  name: string | null;
  email: string;
  global_roles: JSONColumnType<UserRole[]>;
  project_roles: JSONColumnType<
    {
      project_id: string;
      roles: UserProjectRole[];
    }[]
  >;
  created_at: GeneratedAlways<Date>;
  updated_at: GeneratedAlways<Date>;
  disabled_at: Date | null;
};
export type User = Selectable<UserTable>;

export type AccountProvider = 'microsoft-entra-id';
export type AccountTable = {
  id: GeneratedAlways<string>;
  user_id: string;
  provider: AccountProvider;
  provider_account_id: string;
};
export type UserSession = {
  id: GeneratedAlways<string>;
  user_id: string;
  account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  access_token_expires_at: Date | null;
  refresh_token_expires_at: Date | null;

  last_activity_at: Date;
  expires_at: Date;
  disabled_at: Date | null;
};

export type Account = Selectable<AccountTable>;
