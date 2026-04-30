import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '../domain/invoice.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Invoice, InvoiceStatus } from '@prisma/client';

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, tenantId: string): Promise<Invoice | null> {
    const i = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    return i;
  }

  async findAll(tenantId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({ where: { tenantId } });
    return invoices;
  }

  async create(
    data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'paidDate'> & { id?: string },
  ): Promise<Invoice> {
    const totalInvoices = await this.prisma.invoice.count({ where: { tenantId: data.tenantId } });
    const invoiceNumber =
      data.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${String(totalInvoices + 1).padStart(4, '0')}`;

    const i = await this.prisma.invoice.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        tenantId: data.tenantId,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        invoiceNumber,
        amount: data.amount,
        status: data.status,
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });
    return i;
  }

  async update(
    id: string,
    data: Partial<Omit<Invoice, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Invoice> {
    const i = await this.prisma.invoice.update({
      where: { id },
      data: {
        amount: data.amount,
        status: data.status,
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        notes: data.notes,
      },
    });
    return i;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: InvoiceStatus,
    paidDate?: Date,
  ): Promise<Invoice> {
    await this.prisma.invoice.updateMany({
      where: { id, tenantId },
      data: { status, paidDate },
    });
    const updated = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    return updated!;
  }
}
