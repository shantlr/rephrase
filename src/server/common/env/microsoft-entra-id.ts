import getenv from 'getenv';

export const MICROSOFT_ENTRA_ID_CLIENT_ID = getenv(
  'MICROSOFT_ENTRA_ID_CLIENT_ID',
  '',
);

export const MICROSOFT_ENTRA_ID_CLIENT_SECRET = getenv(
  'MICROSOFT_ENTRA_ID_CLIENT_SECRET',
  '',
);

export const MICROSOFT_ENTRA_ID_TENANT_ID = getenv(
  'MICROSOFT_ENTRA_ID_TENANT_ID',
  'common',
);

export const MICROSOFT_ENTRA_ID_REDIRECT_URI = getenv(
  'MICROSOFT_ENTRA_ID_REDIRECT_URI',
  'http://localhost:3000/api/auth/callback/microsoft-entra-id',
);

export const MICROSOFT_ENTRA_ID_SSO_SESSION_KEY_PREFIX = getenv(
  'MICROSOFT_ENTRA_ID_SSO_SESSION_KEY_PREFIX',
  '@rephrase/entra-id/sso',
);
