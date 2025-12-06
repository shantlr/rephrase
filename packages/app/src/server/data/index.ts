import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import {
  PG_DATABASE,
  PG_HOST,
  PG_PASSWORD,
  PG_PORT,
  PG_USER,
} from '../common/env';
import { Database } from './db';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: PG_DATABASE,
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    port: PG_PORT,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
