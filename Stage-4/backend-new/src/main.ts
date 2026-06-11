import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startCronJobs } from './services/cron';
import { syncDatabaseSchema } from './db/sync-schema';

function validateEnvironment() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is required. Please add it to your .env file.',
    );
  }
}

async function bootstrap() {
  validateEnvironment();

  await syncDatabaseSchema();

  const app = await NestFactory.create(AppModule);

  const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  app.enableCors({
  origin: [
    'https://dierha.com',
    'https://www.dierha.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;

  await app.listen(port);

  startCronJobs();

  console.log(`Server running on port ${port}`);
}

bootstrap();
