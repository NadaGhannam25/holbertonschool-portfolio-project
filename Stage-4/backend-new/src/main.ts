import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startCronJobs } from './services/cron';
import { syncDatabaseSchema } from './db/sync-schema';
import { initBrowser, initLogo } from './services/pdf';

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
    'http://localhost:5173',
    'https://dierha.com',
    'https://www.dierha.com',
    'https://dierha-frontend.onrender.com',
    'https://holbertonschool-portfolio.nada-ghannam19.workers.dev',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
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

  // تحميل Chrome واللوقو مرة واحدة عند البدء — الـ PDF request أول ما يجي يكون جاهز
  void Promise.all([initBrowser(), initLogo()]);

  console.log(`Server running on port ${port}`);
}

bootstrap();
