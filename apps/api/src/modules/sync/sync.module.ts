import { Module } from '@nestjs/common';
import { SyncController } from './presentation/sync.controller';
import { SyncService } from './application/sync.service';
import { CustomersModule } from '../customers/customers.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [CustomersModule, InvoicesModule, PaymentsModule, SubscriptionsModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
