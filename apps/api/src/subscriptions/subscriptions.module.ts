import { Module } from '@nestjs/common';
import { SubscriptionsApplicationService } from './application/subscriptions.application.service';
import { SubscriptionsController } from './presentation/subscriptions.controller';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsApplicationService],
  exports: [SubscriptionsApplicationService],
})
export class SubscriptionsModule {}
