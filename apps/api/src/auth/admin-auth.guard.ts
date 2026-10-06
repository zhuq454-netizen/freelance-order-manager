import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

import { IS_PUBLIC_ROUTE } from './public.decorator.js';

export { IS_PUBLIC_ROUTE } from './public.decorator.js';

export type AdminPrincipal = { adminId: 'admin' };
type AuthenticatedRequest = Request & { user?: AdminPrincipal };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
        handler,
        controller,
      ]) ||
      this.isHealthRequest(request)
    ) {
      return true;
    }

    const expectedToken = this.config.get<string>('ADMIN_TOKEN');
    const providedToken = this.readBearerToken(request.headers.authorization);
    if (
      !expectedToken ||
      !providedToken ||
      !this.tokensMatch(expectedToken, providedToken)
    ) {
      throw new UnauthorizedException();
    }

    request.user = { adminId: 'admin' };
    return true;
  }

  private readBearerToken(header: string | undefined): string | undefined {
    const match = /^Bearer\s+([^\s]+)$/i.exec(header ?? '');
    return match?.[1];
  }

  private tokensMatch(expected: string, provided: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided);
    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    );
  }

  private isHealthRequest(request: Request): boolean {
    return request.path?.includes('/health/') ?? false;
  }
}
