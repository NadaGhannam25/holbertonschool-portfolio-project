import { Module } from '@nestjs/common';

import { SubscriptionsController } from './subscriptions.controller';
import { PdfController } from './pdf.controller';

import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [
    SubscriptionsController,
    PdfController,
  ],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
