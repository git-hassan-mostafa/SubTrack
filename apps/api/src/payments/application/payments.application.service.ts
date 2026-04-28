import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingApplicationService } from '../../messaging/application/messaging.application.service';

@Injectable()
export class PaymentsApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingApplicationService,
  ) {}

  list(tenantId: string, invoiceId?: string) {
    return this.prisma.payment.findMany({
      where: { tenantId, ...(invoiceId ? { invoiceId } : {}) },
      include: { invoice: { include: { customer: true } } },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async getById(tenantId: string, id: string) {
    const row = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: { invoice: { include: { customer: true } } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async create(
    tenantId: string,
    data: {
      invoiceId: string;
      amount: number;
      method: import('@prisma/client').PaymentMethod;
      referenceNumber?: string | null;
      paymentDate: Date;
      notes?: string | null;
    },
  ) {
    if (data.amount <= 0) {
      throw new BadRequestException('amount must be greater than zero');
    }
    if (data.paymentDate > new Date()) {
      throw new BadRequestException('paymentDate cannot be in the future');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
      include: { customer: true, payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled invoice');
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          referenceNumber: data.referenceNumber ?? null,
          paymentDate: data.paymentDate,
          notes: data.notes ?? null,
        },
      });
      const payments = await tx.payment.findMany({ where: { invoiceId: data.invoiceId } });
      const totalPaid = payments.reduce((s, x) => s + x.amount, 0);
      const paid = totalPaid >= invoice.amount;
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: paid
          ? { status: InvoiceStatus.PAID, paidDate: new Date() }
          : { status: InvoiceStatus.PENDING, paidDate: null },
      });
      return p;
    });

    const updatedInvoice = await this.prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
      include: { customer: true, payments: true },
    });
    if (updatedInvoice?.status === InvoiceStatus.PAID) {
      void this.messaging
        .sendPaymentConfirmation({
          customerName: updatedInvoice.customer.name,
          customerPhone: updatedInvoice.customer.phone,
          paymentAmount: data.amount,
          invoiceNumber: updatedInvoice.invoiceNumber,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('WhatsApp payment confirmation failed', err);
        });
    }

    return this.getById(tenantId, payment.id);
  }
}
