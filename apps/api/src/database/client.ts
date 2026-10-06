import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema.js';

export function createDatabaseClient(connectionString: string) {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  return {
    database: drizzle(pool, { schema }),
    pool,
  };
}
