import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingApplicationService } from '../../messaging/application/messaging.application.service';
import { PricingCalculationService } from '../../pricing-rules/application/pricing-calculation.service';

@Injectable()
export class InvoicesApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingCalculationService,
    private readonly messaging: MessagingApplicationService,
  ) {}

  list(tenantId: string, status?: InvoiceStatus) {
    return this.prisma.invoice
      .findMany({
        where: {
          tenantId,
          ...(status ? { status } : {}),
        },
        include: { customer: true, subscription: true },
        orderBy: { issuedDate: 'desc' },
      })
      .then((rows) => rows.map((r) => ({ ...r, status: this.effectiveStatus(r) })));
  }

  async getById(tenantId: string, id: string) {
    const row = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { customer: true, subscription: { include: { pricingRule: true } }, payments: true },
    });
    if (!row) throw new NotFoundException();
    return { ...row, status: this.effectiveStatus(row) };
  }

  async generate(tenantId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, tenantId },
      include: { pricingRule: true, customer: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');

    const amount = this.pricing.calculateInvoiceAmount(sub, sub.pricingRule);

    const created = await this.prisma.$transaction(async (tx) => {
      const agg = await tx.invoice.aggregate({
        where: { tenantId },
        _max: { invoiceNumber: true },
      });
      const n = (agg._max.invoiceNumber ?? 0) + 1;
      const issuedDate = new Date();
      const dueDate = new Date(issuedDate);
      dueDate.setDate(dueDate.getDate() + 30);

      return tx.invoice.create({
        data: {
          tenantId,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          invoiceNumber: n,
          amount,
          status: InvoiceStatus.PENDING,
          dueDate,
          issuedDate,
        },
        include: { customer: true },
      });
    });

    const full = await this.getById(tenantId, created.id);
    void this.messaging.sendInvoiceNotification(full).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('WhatsApp invoice notification failed', err);
    });
    return full;
  }

  async patch(
    tenantId: string,
    id: string,
    data: Partial<{ notes: string | null; dueDate: Date }>,
  ) {
    const inv = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!inv) throw new NotFoundException();
    if (inv.status === InvoiceStatus.CANCELLED) {
      throw new ForbiddenException('Cannot update cancelled invoice');
    }
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { customer: true, subscription: true, payments: true },
    });
  }

  async cancel(tenantId: string, id: string) {
    const inv = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!inv) throw new NotFoundException();
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
  }

  effectiveStatus(inv: { status: InvoiceStatus; dueDate: Date }): InvoiceStatus {
    if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.CANCELLED) {
      return inv.status;
    }
    if (inv.status === InvoiceStatus.PENDING && inv.dueDate < new Date()) {
      return InvoiceStatus.OVERDUE;
    }
    return inv.status;
  }
}
