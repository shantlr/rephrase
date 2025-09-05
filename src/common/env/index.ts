import getenv from 'getenv';

export const PG_DATABASE = getenv('PG_DATABASE', 'rewrite');
export const PG_HOST = getenv('PG_HOST', 'localhost');
export const PG_USER = getenv('PG_USER', 'admin');
export const PG_PASSWORD = getenv('PG_PASSWORD', '');
export const PG_PORT = getenv.int('PG_PORT', 5432);
