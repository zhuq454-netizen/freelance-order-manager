import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AdminAuthGuard } from './admin-auth.guard.js';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AdminAuthGuard,
    },
  ],
})
export class AuthModule {}
