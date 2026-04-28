import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CustomerDebtView {
  totalInvoiced: number;
  totalPaid: number;
  currentDebt: number;
  overdueAmount: number;
}

@Injectable()
export class CustomerDebtApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getDebt(tenantId: string, customerId: string): Promise<CustomerDebtView> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw new NotFoundException();

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId, customerId, status: { not: InvoiceStatus.CANCELLED } },
      include: { payments: true },
    });

    const now = new Date();
    let totalInvoiced = 0;
    let totalPaid = 0;
    let overdueAmount = 0;

    for (const inv of invoices) {
      totalInvoiced += inv.amount;
      const paidSum = inv.payments.reduce((s, p) => s + p.amount, 0);
      totalPaid += paidSum;
      const effectiveStatus = this.effectiveInvoiceStatus(inv, now);
      const unpaid = Math.max(0, inv.amount - paidSum);
      if (
        (effectiveStatus === InvoiceStatus.PENDING ||
          effectiveStatus === InvoiceStatus.OVERDUE) &&
        unpaid > 0
      ) {
        if (inv.dueDate < now) {
          overdueAmount += unpaid;
        }
      }
    }

    return {
      totalInvoiced,
      totalPaid,
      currentDebt: Math.max(0, totalInvoiced - totalPaid),
      overdueAmount,
    };
  }

  private effectiveInvoiceStatus(
    inv: { status: InvoiceStatus; dueDate: Date },
    now: Date,
  ): InvoiceStatus {
    if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.CANCELLED) {
      return inv.status;
    }
    if (inv.status === InvoiceStatus.PENDING && inv.dueDate < now) {
      return InvoiceStatus.OVERDUE;
    }
    return inv.status;
  }
}
