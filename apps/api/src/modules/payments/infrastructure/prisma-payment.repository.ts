import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../domain/payment.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Payment, PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(p: any): Payment {
    return {
      id: p.id,
      tenantId: p.tenantId,
      invoiceId: p.invoiceId,
      amount: new Prisma.Decimal(p.amount),
      method: p.method as PaymentMethod,
      referenceNumber: p.referenceNumber,
      paymentDate: p.paymentDate,
      notes: p.notes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Payment | null> {
    const p = await this.prisma.payment.findFirst({ where: { id, tenantId } });
    return p ? this.mapToDomain(p) : null;
  }

  async findAll(tenantId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({ where: { tenantId } });
    return payments.map((p) => this.mapToDomain(p));
  }

  async findByInvoiceId(invoiceId: string, tenantId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({ where: { invoiceId, tenantId } });
    return payments.map((p) => this.mapToDomain(p));
  }

  async create(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<Payment> {
    const p = await this.prisma.payment.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        tenantId: data.tenantId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        referenceNumber: data.referenceNumber,
        paymentDate: data.paymentDate,
        notes: data.notes,
      },
    });
    return this.mapToDomain(p);
  }
}
