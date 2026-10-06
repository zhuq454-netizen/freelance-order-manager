import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { validateWorkerEnvironment } from './config/env.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateWorkerEnvironment,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(
          config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        );
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port || 6379),
            ...(redisUrl.username
              ? { username: decodeURIComponent(redisUrl.username) }
              : {}),
            ...(redisUrl.password
              ? { password: decodeURIComponent(redisUrl.password) }
              : {}),
          },
        };
      },
    }),
  ],
})
export class AppModule {}
