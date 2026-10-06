import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { configureHttp } from '../src/config/http.js';

describe('admin inquiry endpoints', () => {
  let app: INestApplication;
  const previousToken = process.env.ADMIN_TOKEN;

  beforeAll(async () => {
    process.env.ADMIN_TOKEN = 'test-admin-token';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (previousToken === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = previousToken;
    await app.close();
  });

  it('requires the configured admin bearer token', async () => {
    await request(app.getHttpServer()).get('/api/admin/inquiries').expect(401);
  });

  it('returns an explicit database-unavailable response after authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/inquiries')
      .set('Authorization', 'Bearer test-admin-token')
      .expect(503);

    expect(response.body.message).toBe('数据库暂不可用，请稍后重试。');
  });
});
