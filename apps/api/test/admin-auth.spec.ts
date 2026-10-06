import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import {
  AdminAuthGuard,
  IS_PUBLIC_ROUTE,
} from '../src/auth/admin-auth.guard.js';

describe('admin authentication boundary', () => {
  const reflector = new Reflector();
  const guard = new AdminAuthGuard(
    reflector,
    new ConfigService({ ADMIN_TOKEN: 'test-admin-token' }),
  );

  function createContext(
    authorization?: string,
    handler: object = () => undefined,
  ): ExecutionContext {
    const request = {
      headers: authorization === undefined ? {} : { authorization },
      path: '/api/admin/auth-check',
    } as { headers: Record<string, string | undefined>; path: string };

    return {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => undefined,
        getNext: () => undefined,
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects missing and invalid admin credentials', () => {
    expect(() => guard.canActivate(createContext())).toThrowError(
      'Unauthorized',
    );
    expect(() =>
      guard.canActivate(createContext('Bearer wrong-token')),
    ).toThrowError('Unauthorized');
  });

  it('accepts the configured bearer credential and identifies the admin', () => {
    const context = createContext('Bearer test-admin-token');

    expect(guard.canActivate(context)).toBe(true);
    expect(context.switchToHttp().getRequest()).toMatchObject({
      user: { adminId: 'admin' },
    });
  });

  it('allows routes marked public without credentials', () => {
    const publicHandler = () => undefined;
    Reflect.defineMetadata(IS_PUBLIC_ROUTE, true, publicHandler);

    expect(guard.canActivate(createContext(undefined, publicHandler))).toBe(
      true,
    );
  });
});
