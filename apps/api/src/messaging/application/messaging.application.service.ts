import { Inject, Injectable } from '@nestjs/common';
import type { IWhatsAppProvider } from '../domain/whatsapp-provider.port';
import { WHATSAPP_PROVIDER } from '../domain/whatsapp-provider.port';

export interface InvoiceNotifyInput {
  customerName: string;
  customerPhone: string;
  invoiceNumber: number;
  amount: number;
  dueDate: Date;
}

export interface PaymentConfirmInput {
  customerName: string;
  customerPhone: string;
  paymentAmount: number;
  invoiceNumber: number;
}

export interface OverdueNotifyInput {
  customerName: string;
  customerPhone: string;
  invoiceNumber: number;
  amount: number;
  dueDate: Date;
}

@Injectable()
export class MessagingApplicationService {
  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsapp: IWhatsAppProvider,
  ) {}

  async sendInvoiceNotification(inv: {
    customer: { name: string; phone: string };
    invoiceNumber: number;
    amount: number;
    dueDate: Date;
  }): Promise<void> {
    const body: InvoiceNotifyInput = {
      customerName: inv.customer.name,
      customerPhone: inv.customer.phone,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      dueDate: inv.dueDate,
    };
    const message = `Dear ${body.customerName}, your invoice #${body.invoiceNumber} for ${body.amount} is ready. Due date: ${body.dueDate.toISOString().slice(0, 10)}. Thank you for your business.`;
    await this.whatsapp.sendMessage(body.customerPhone, message);
  }

  async sendPaymentConfirmation(input: PaymentConfirmInput): Promise<void> {
    const message = `Dear ${input.customerName}, we received your payment of ${input.paymentAmount} for invoice #${input.invoiceNumber}. Thank you!`;
    await this.whatsapp.sendMessage(input.customerPhone, message);
  }

  async sendOverdueReminder(input: OverdueNotifyInput): Promise<void> {
    const message = `Dear ${input.customerName}, your invoice #${input.invoiceNumber} for ${input.amount} was due on ${input.dueDate.toISOString().slice(0, 10)}. Please make payment at your earliest convenience.`;
    await this.whatsapp.sendMessage(input.customerPhone, message);
  }
}
