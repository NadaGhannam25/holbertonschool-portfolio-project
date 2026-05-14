import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    CategoriesModule,
    AuthModule,
    SubscriptionsModule,
    AnalyticsModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
