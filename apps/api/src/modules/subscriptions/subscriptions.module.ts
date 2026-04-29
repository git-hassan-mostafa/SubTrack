import { Module } from '@nestjs/common';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionsController } from './presentation/subscriptions.controller';
import { PrismaSubscriptionRepository } from './infrastructure/prisma-subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from './domain/subscription.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    SubscriptionService,
  ],
  exports: [SubscriptionService, SUBSCRIPTION_REPOSITORY],
})
export class SubscriptionsModule {}
