import getenv from 'getenv';

export const PG_DATABASE = getenv('PG_DATABASE', 'rewrite');
export const PG_HOST = getenv('PG_HOST', 'localhost');
export const PG_USER = getenv('PG_USER', 'admin');
export const PG_PASSWORD = getenv('PG_PASSWORD', '');
export const PG_PORT = getenv.int('PG_PORT', 5432);

export const REDIS_HOST = getenv('REDIS_HOST', 'localhost');
export const REDIS_PORT = getenv.int('REDIS_PORT', 6379);

export const COOKIE_PREFIX = getenv('COOKIE_PREFIX', 'rewrite_');

export const SESSION_EXPIRATION_DAYS = getenv.int(
  'SESSION_EXPIRATION_DAYS',
  60,
);
export const SESSION_ENCRYPTION_KEY = getenv('SESSION_ENCRYPTION_KEY');

export const SESSION_COOKIE_DOMAIN = getenv(
  'SESSION_COOKIE_DOMAIN',
  'localhost',
);
export const SESSION_COOKIE_SECURE = getenv.boolish(
  'SESSION_COOKIE_SECURE',
  true,
);
export const SESSION_COOKIE_SAME_SITE = getenv(
  'SESSION_COOKIE_SAME_SITE',
  'lax',
) as 'strict' | 'lax' | 'none';
export const SESSION_COOKIE_NAME = `${COOKIE_PREFIX}session`;

export const SESSION_UPDATE_LAST_ACTIVITY_AT_DELAY_MINUTES = getenv.int(
  'SESSION_UPDATE_LAST_ACTIVITY_AT_DELAY_MINUTES',
  5,
);
