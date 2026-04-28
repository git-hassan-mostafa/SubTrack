import { Module } from '@nestjs/common';
import { MessagingModule } from '../messaging/messaging.module';
import { PricingRulesModule } from '../pricing-rules/pricing-rules.module';
import { InvoicesApplicationService } from './application/invoices.application.service';
import { InvoicesController } from './presentation/invoices.controller';

@Module({
  imports: [PricingRulesModule, MessagingModule],
  controllers: [InvoicesController],
  providers: [InvoicesApplicationService],
})
export class InvoicesModule {}
