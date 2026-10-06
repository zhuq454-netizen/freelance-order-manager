import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '../src/app.module.js';

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');

const config = new DocumentBuilder()
  .setTitle('OrderlyDesk API')
  .setDescription('OrderlyDesk shared API contract')
  .setVersion('0.1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);

await writeFile(
  resolve(process.cwd(), 'openapi.json'),
  `${JSON.stringify(document, null, 2)}\n`,
);
await app.close();
