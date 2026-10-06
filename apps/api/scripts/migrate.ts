import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { createDatabaseClient } from '../src/database/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run database migrations.');
}

const { database, pool } = createDatabaseClient(connectionString);
try {
  await migrate(database, {
    migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
  });
} catch (error) {
  throw new Error(
    `Database migration failed. Check DATABASE_URL and PostgreSQL availability. ${String(error)}`,
  );
} finally {
  await pool.end();
}
