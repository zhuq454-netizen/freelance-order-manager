import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { configureHttp } from '../src/config/http.js';

describe('public content endpoints without a database', () => {
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

  it('keeps public content routes available without admin credentials', async () => {
    await request(app.getHttpServer()).get('/api/public/content').expect(503);
  });

  it('rejects malformed inquiry input before database access', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/public/inquiries')
      .send({ contactName: '', consent: false })
      .expect(400);

    expect(response.body.message).toBe('需求信息不完整或格式不正确。');
  });

  it('returns an explicit service-unavailable response for valid input without a database', async () => {
    await request(app.getHttpServer())
      .post('/api/public/inquiries')
      .send({
        contactName: '林先生',
        contactValue: 'lin@example.com',
        contactMethod: 'email',
        title: '新品发布影像',
        description: '需要一支发布视频。',
        consent: true,
      })
      .expect(503);
  });
});
