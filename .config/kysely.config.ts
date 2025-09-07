import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

import {
  PG_DATABASE,
  PG_HOST,
  PG_PASSWORD,
  PG_PORT,
  PG_USER,
} from '../src/server/common/env';

export default defineConfig({
  // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
  dialect: 'pg',
  dialectConfig: {
    pool: new Pool({
      database: PG_DATABASE,
      host: PG_HOST,
      user: PG_USER,
      password: PG_PASSWORD,
      port: PG_PORT,
      max: 10,
    }),
  },
  migrations: {
    migrationFolder: 'migrations',
  },
  //   plugins: [],
  //   seeds: {
  //     seedFolder: "seeds",
  //   }
});
