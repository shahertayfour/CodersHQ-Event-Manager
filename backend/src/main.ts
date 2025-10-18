import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with logging
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://localhost:80',
      'http://localhost',
      'https://dashboard.codershq.ae',
      'https://codershq.ae',
      /https:\/\/.*\.codershq-event-manager\.pages\.dev$/,
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
