import { healthResponseSchema } from '@orderlydesk/contracts';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { configureHttp } from '../src/config/http.js';

describe('API health endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports process liveness using the shared contract', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200);

    expect(healthResponseSchema.parse(response.body)).toMatchObject({
      status: 'ok',
      service: 'api',
    });
  });

  it('reports readiness without requiring business modules', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/ready')
      .expect(200);

    expect(healthResponseSchema.parse(response.body)).toMatchObject({
      status: 'ok',
      service: 'api',
    });
  });

  it('allows the local Web development origin to call the API', async () => {
    await request(app.getHttpServer())
      .get('/api/health/live')
      .set('Origin', 'http://127.0.0.1:5173')
      .expect('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
      .expect(200);
  });

  it('allows a fallback Vite port on the local loopback address', async () => {
    await request(app.getHttpServer())
      .get('/api/health/live')
      .set('Origin', 'http://127.0.0.1:5174')
      .expect('Access-Control-Allow-Origin', 'http://127.0.0.1:5174')
      .expect(200);
  });
});
