// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8082',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // const cfg = new DocumentBuilder()
  //   .setTitle('Booksan API')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();
  // const doc = SwaggerModule.createDocument(app, cfg);
  // SwaggerModule.setup('/docs', app, doc);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
