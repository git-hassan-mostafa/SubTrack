import { Module } from '@nestjs/common';
import { InvoiceService } from './application/invoice.service';
import { InvoicesController } from './presentation/invoices.controller';
import { PrismaInvoiceRepository } from './infrastructure/prisma-invoice.repository';
import { INVOICE_REPOSITORY } from './domain/invoice.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { PricingRulesModule } from '../pricing-rules/pricing-rules.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, PricingRulesModule, EventEmitterModule],
  controllers: [InvoicesController],
  providers: [
    {
      provide: INVOICE_REPOSITORY,
      useClass: PrismaInvoiceRepository,
    },
    InvoiceService,
  ],
  exports: [InvoiceService, INVOICE_REPOSITORY],
})
export class InvoicesModule {}
