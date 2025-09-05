import { GeneratedAlways, JSONColumnType } from 'kysely';

export type UserRole = 'admin' | 'default';

export type UserProjectRole = 'admin' | 'reader' | 'maintainer';

export type User = {
  id: GeneratedAlways<string>;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;

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
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
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
  userId: string;
  sessionToken: string;
  expires: Date;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};
