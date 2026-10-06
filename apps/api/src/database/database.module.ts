import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { createDatabaseClient } from './client.js';
import * as schema from './schema.js';

export const DATABASE = Symbol('DATABASE');

export type Database = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly database: Database | undefined;
  readonly pool: Pool | undefined;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    if (connectionString) {
      const client = createDatabaseClient(connectionString);
      this.database = client.database;
      this.pool = client.pool;
    }
  }

  requireDatabase(): Database {
    if (!this.database) {
      throw new Error(
        'DATABASE_URL is required for database-backed API operations.',
      );
    }
    return this.database;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: DATABASE,
      inject: [DatabaseService],
      useFactory: (databaseService: DatabaseService) =>
        databaseService.database,
    },
  ],
  exports: [DATABASE, DatabaseService],
})
export class DatabaseModule {}
