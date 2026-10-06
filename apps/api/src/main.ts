import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureHttp } from './config/http.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  const prefix = process.env.API_PREFIX ?? 'api';
  app.setGlobalPrefix(prefix);

  const openApiConfig = new DocumentBuilder()
    .setTitle('OrderlyDesk API')
    .setDescription('OrderlyDesk shared API contract')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  if (process.env.OPENAPI_UI !== 'false') {
    SwaggerModule.setup(`${prefix}/docs`, app, document);
  }

  await app.listen(Number(process.env.PORT ?? 3000));
}
await bootstrap();
