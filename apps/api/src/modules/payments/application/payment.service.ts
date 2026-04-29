import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../domain/payment.repository';
import { CreatePaymentDto } from '../presentation/dto/payment.dto';
import { InvoiceStatus } from '@subtrack/shared';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentRecordedEvent } from '../../messaging/application/messaging.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: PaymentRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string) {
    return this.paymentRepo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const payment = await this.paymentRepo.findById(id, tenantId);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async record(tenantId: string, dto: CreatePaymentDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const paymentDate = new Date(dto.paymentDate);
    if (paymentDate > new Date()) {
      throw new BadRequestException('Payment date cannot be in the future');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled invoice');
    }

    const payment = await this.paymentRepo.create({
      tenantId,
      invoiceId: invoice.id,
      amount: dto.amount,
      method: dto.method,
      referenceNumber: dto.referenceNumber ?? null,
      paymentDate,
      notes: dto.notes ?? null,
    });

    const allPayments = await this.prisma.payment.findMany({
      where: { invoiceId: invoice.id },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalPaid >= Number(invoice.amount) && invoice.status !== InvoiceStatus.PAID) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.PAID, paidDate: new Date() },
      });
    }

    this.eventEmitter.emit('payment.recorded', new PaymentRecordedEvent(payment.id));

    return payment;
  }

  async getDebtSummary(customerId: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const invoices = await this.prisma.invoice.findMany({
      where: { customerId, tenantId, status: { not: InvoiceStatus.CANCELLED } },
      include: { payments: true },
    });

    const now = new Date();
    let totalInvoiced = 0;
    let totalPaid = 0;
    let overdueAmount = 0;

    for (const inv of invoices) {
      const amount = Number(inv.amount);
      const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      totalInvoiced += amount;
      totalPaid += paid;

      const isOverdue =
        (inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE) &&
        new Date(inv.dueDate) < now;
      if (isOverdue) {
        overdueAmount += amount - paid;
      }
    }

    return {
      customerId,
      totalInvoiced,
      totalPaid,
      currentDebt: totalInvoiced - totalPaid,
      overdueAmount,
    };
  }
}
