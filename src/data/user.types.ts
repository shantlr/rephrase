import { GeneratedAlways, JSONColumnType } from 'kysely';

export type UserRole = 'admin' | 'default';

export type UserProjectRole = 'admin' | 'reader' | 'maintainer';

export type User = {
  id: GeneratedAlways<string>;
  name: string | null;
  email: string;
  global_roles: UserRole[];
  project_roles: JSONColumnType<
    {
      project_id: string;
      roles: UserProjectRole[];
    }[]
  >;
};
export type Account = {
  id: GeneratedAlways<string>;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Session = {
  id: GeneratedAlways<string>;
  user_id: string;
  session_token: string;
  expires: Date;
};
