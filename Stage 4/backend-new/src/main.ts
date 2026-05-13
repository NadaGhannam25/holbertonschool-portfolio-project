import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startCronJobs } from './services/cron';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  startCronJobs();

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
