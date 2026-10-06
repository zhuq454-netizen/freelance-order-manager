import { createDatabaseClient } from '../src/database/client.js';
import { seedPhaseOne } from '../src/database/seed-phase-1.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const { database, pool } = createDatabaseClient(connectionString);
try {
  await seedPhaseOne(database);
} catch (error) {
  throw new Error(
    `Database seed failed. Run migrations and check PostgreSQL availability. ${String(error)}`,
  );
} finally {
  await pool.end();
}
