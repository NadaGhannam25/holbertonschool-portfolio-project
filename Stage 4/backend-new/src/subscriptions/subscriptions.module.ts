import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [SubscriptionsController, PdfController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
