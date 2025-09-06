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
    origin: '*',
    credentials: true,
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
