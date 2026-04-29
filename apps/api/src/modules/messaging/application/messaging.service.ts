import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type IWhatsAppProvider, WHATSAPP_PROVIDER } from '../domain/whatsapp-provider.interface';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Event payloads defined here for type-safety without circular dependencies.
 */
export class InvoiceCreatedEvent {
  constructor(public readonly invoiceId: string) {}
}

export class PaymentRecordedEvent {
  constructor(public readonly paymentId: string) {}
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(WHATSAPP_PROVIDER) private readonly whatsappProvider: IWhatsAppProvider,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('invoice.created')
  async handleInvoiceCreated(event: InvoiceCreatedEvent) {
    this.logger.log(`Handling invoice.created event for invoice ${event.invoiceId}`);
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: event.invoiceId },
        include: { customer: true },
      });

      if (!invoice || !invoice.customer.phone) return;

      const body = `Hello ${invoice.customer.name},\n\nA new invoice (${invoice.invoiceNumber}) for ${invoice.amount} has been generated. It is due by ${invoice.dueDate.toISOString().split('T')[0]}.\n\nThank you for choosing SubTrack!`;

      await this.whatsappProvider.sendMessage({
        to: invoice.customer.phone,
        body,
      });
    } catch (error) {
      this.logger.error(`Error notifying customer for invoice ${event.invoiceId}:`, error);
    }
  }

  @OnEvent('payment.recorded')
  async handlePaymentRecorded(event: PaymentRecordedEvent) {
    this.logger.log(`Handling payment.recorded event for payment ${event.paymentId}`);
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: event.paymentId },
        include: { invoice: { include: { customer: true } } },
      });

      if (!payment || !payment.invoice.customer.phone) return;

      const body = `Hello ${payment.invoice.customer.name},\n\nWe have received your payment of ${payment.amount} via ${payment.method} for invoice ${payment.invoice.invoiceNumber}.\n\nThank you!`;

      await this.whatsappProvider.sendMessage({
        to: payment.invoice.customer.phone,
        body,
      });
    } catch (error) {
      this.logger.error(`Error notifying customer for payment ${event.paymentId}:`, error);
    }
  }
}
