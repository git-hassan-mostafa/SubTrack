import { Injectable } from '@nestjs/common';
import {
  CustomerStatus,
  InvoiceStatus,
  PaymentMethod,
  PricingRuleType,
  SubscriptionStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SyncOperationDto } from '../presentation/dto/sync-batch.dto';

export type SyncResultStatus = 'SUCCESS' | 'CONFLICT' | 'ERROR';

export interface SyncBatchResultItem {
  entityId: string;
  status: SyncResultStatus;
  serverVersion?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class SyncBatchApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async process(tenantId: string, operations: SyncOperationDto[]): Promise<{ results: SyncBatchResultItem[] }> {
    const results: SyncBatchResultItem[] = [];
    for (const op of operations) {
      try {
        results.push(await this.applyOne(tenantId, op));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        results.push({ entityId: op.entityId, status: 'ERROR', error: message });
      }
    }
    return { results };
  }

  private async applyOne(tenantId: string, op: SyncOperationDto): Promise<SyncBatchResultItem> {
    const clientTime = new Date(op.updatedAt);
    switch (op.entityType) {
      case 'customer':
        return this.applyCustomer(tenantId, op, clientTime);
      case 'invoice':
        return this.applyInvoice(tenantId, op, clientTime);
      case 'payment':
        return this.applyPayment(tenantId, op, clientTime);
      case 'subscription':
        return this.applySubscription(tenantId, op, clientTime);
      case 'pricing_rule':
        return this.applyPricingRule(tenantId, op, clientTime);
      default:
        return { entityId: op.entityId, status: 'ERROR', error: 'Unknown entityType' };
    }
  }

  private async applyCustomer(
    tenantId: string,
    op: SyncOperationDto,
    clientTime: Date,
  ): Promise<SyncBatchResultItem> {
    const id = op.entityId;
    const existing = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (op.operation === 'DELETE') {
      if (!existing) {
        return { entityId: id, status: 'SUCCESS' };
      }
      if (clientTime > existing.updatedAt) {
        await this.prisma.customer.update({
          where: { id },
          data: { status: CustomerStatus.INACTIVE, updatedAt: clientTime },
        });
        return { entityId: id, status: 'SUCCESS' };
      }
      return {
        entityId: id,
        status: 'CONFLICT',
        serverVersion: this.serializeCustomer(existing),
      };
    }
    const data = this.parseCustomerPayload(tenantId, op.payload);
    if (!existing) {
      await this.prisma.customer.create({
        data: { ...data, id, tenantId, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    if (clientTime > existing.updatedAt) {
      await this.prisma.customer.update({
        where: { id },
        data: { ...data, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    return {
      entityId: id,
      status: 'CONFLICT',
      serverVersion: this.serializeCustomer(existing),
    };
  }

  private parseCustomerPayload(
    tenantId: string,
    p: Record<string, unknown>,
  ): Omit<import('@prisma/client').Prisma.CustomerCreateInput, 'id' | 'tenant' | 'tenantId'> {
    return {
      name: String(p.name ?? ''),
      phone: String(p.phone ?? ''),
      address: String(p.address ?? ''),
      latitude: p.latitude === null || p.latitude === undefined ? null : Number(p.latitude),
      longitude: p.longitude === null || p.longitude === undefined ? null : Number(p.longitude),
      locationAccuracy:
        p.locationAccuracy === null || p.locationAccuracy === undefined
          ? null
          : Number(p.locationAccuracy),
      status: (p.status as CustomerStatus) ?? CustomerStatus.ACTIVE,
    };
  }

  private serializeCustomer(row: import('@prisma/client').Customer): Record<string, unknown> {
    return { ...row, updatedAt: row.updatedAt.toISOString(), createdAt: row.createdAt.toISOString() };
  }

  private async applyInvoice(
    tenantId: string,
    op: SyncOperationDto,
    clientTime: Date,
  ): Promise<SyncBatchResultItem> {
    const id = op.entityId;
    const existing = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (op.operation === 'DELETE') {
      if (!existing) return { entityId: id, status: 'SUCCESS' };
      if (clientTime > existing.updatedAt) {
        await this.prisma.invoice.update({
          where: { id },
          data: { status: InvoiceStatus.CANCELLED, updatedAt: clientTime },
        });
        return { entityId: id, status: 'SUCCESS' };
      }
      return { entityId: id, status: 'CONFLICT', serverVersion: this.serializeInvoice(existing) };
    }
    const data = this.parseInvoicePayload(op.payload);
    if (!existing) {
      await this.prisma.invoice.create({
        data: { ...data, id, tenantId, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    if (clientTime > existing.updatedAt) {
      await this.prisma.invoice.update({
        where: { id },
        data: { ...data, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    return { entityId: id, status: 'CONFLICT', serverVersion: this.serializeInvoice(existing) };
  }

  private parseInvoicePayload(p: Record<string, unknown>): Omit<
    import('@prisma/client').Prisma.InvoiceCreateInput,
    'id' | 'tenant' | 'tenantId' | 'customer' | 'subscription'
  > & {
    customerId: string;
    subscriptionId: string;
  } {
    return {
      customerId: String(p.customerId),
      subscriptionId: String(p.subscriptionId),
      invoiceNumber: Number(p.invoiceNumber),
      amount: Number(p.amount),
      status: p.status as InvoiceStatus,
      dueDate: new Date(String(p.dueDate)),
      issuedDate: new Date(String(p.issuedDate)),
      paidDate: p.paidDate ? new Date(String(p.paidDate)) : null,
      notes: p.notes === undefined || p.notes === null ? null : String(p.notes),
      lastOverdueReminderSentAt:
        p.lastOverdueReminderSentAt === undefined || p.lastOverdueReminderSentAt === null
          ? null
          : new Date(String(p.lastOverdueReminderSentAt)),
    };
  }

  private serializeInvoice(row: import('@prisma/client').Invoice): Record<string, unknown> {
    return { ...row, updatedAt: row.updatedAt.toISOString(), createdAt: row.createdAt.toISOString() };
  }

  private async applyPayment(
    tenantId: string,
    op: SyncOperationDto,
    clientTime: Date,
  ): Promise<SyncBatchResultItem> {
    const id = op.entityId;
    const existing = await this.prisma.payment.findFirst({ where: { id, tenantId } });
    if (op.operation === 'DELETE') {
      if (!existing) return { entityId: id, status: 'SUCCESS' };
      if (clientTime > existing.updatedAt) {
        await this.prisma.payment.delete({ where: { id } });
        return { entityId: id, status: 'SUCCESS' };
      }
      return { entityId: id, status: 'CONFLICT', serverVersion: this.serializePayment(existing) };
    }
    const data = this.parsePaymentPayload(op.payload);
    if (!existing) {
      await this.prisma.payment.create({
        data: { ...data, id, tenantId, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    if (clientTime > existing.updatedAt) {
      await this.prisma.payment.update({
        where: { id },
        data: { ...data, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    return { entityId: id, status: 'CONFLICT', serverVersion: this.serializePayment(existing) };
  }

  private parsePaymentPayload(p: Record<string, unknown>) {
    return {
      invoiceId: String(p.invoiceId),
      amount: Number(p.amount),
      method: p.method as PaymentMethod,
      referenceNumber:
        p.referenceNumber === undefined || p.referenceNumber === null
          ? null
          : String(p.referenceNumber),
      paymentDate: new Date(String(p.paymentDate)),
      notes: p.notes === undefined || p.notes === null ? null : String(p.notes),
    };
  }

  private serializePayment(row: import('@prisma/client').Payment): Record<string, unknown> {
    return { ...row, updatedAt: row.updatedAt.toISOString(), createdAt: row.createdAt.toISOString() };
  }

  private async applySubscription(
    tenantId: string,
    op: SyncOperationDto,
    clientTime: Date,
  ): Promise<SyncBatchResultItem> {
    const id = op.entityId;
    const existing = await this.prisma.subscription.findFirst({ where: { id, tenantId } });
    if (op.operation === 'DELETE') {
      if (!existing) return { entityId: id, status: 'SUCCESS' };
      if (clientTime > existing.updatedAt) {
        await this.prisma.subscription.delete({ where: { id } });
        return { entityId: id, status: 'SUCCESS' };
      }
      return {
        entityId: id,
        status: 'CONFLICT',
        serverVersion: this.serializeSubscription(existing),
      };
    }
    const data = this.parseSubscriptionPayload(op.payload);
    if (!existing) {
      await this.prisma.subscription.create({
        data: { ...data, id, tenantId, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    if (clientTime > existing.updatedAt) {
      await this.prisma.subscription.update({
        where: { id },
        data: { ...data, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    return {
      entityId: id,
      status: 'CONFLICT',
      serverVersion: this.serializeSubscription(existing),
    };
  }

  private parseSubscriptionPayload(p: Record<string, unknown>) {
    return {
      customerId: String(p.customerId),
      planName: String(p.planName),
      status: p.status as SubscriptionStatus,
      startDate: new Date(String(p.startDate)),
      endDate: p.endDate ? new Date(String(p.endDate)) : null,
      pricingRuleId: String(p.pricingRuleId),
      customRate: p.customRate === null || p.customRate === undefined ? null : Number(p.customRate),
    };
  }

  private serializeSubscription(row: import('@prisma/client').Subscription): Record<string, unknown> {
    return { ...row, updatedAt: row.updatedAt.toISOString(), createdAt: row.createdAt.toISOString() };
  }

  private async applyPricingRule(
    tenantId: string,
    op: SyncOperationDto,
    clientTime: Date,
  ): Promise<SyncBatchResultItem> {
    const id = op.entityId;
    const existing = await this.prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (op.operation === 'DELETE') {
      if (!existing) return { entityId: id, status: 'SUCCESS' };
      if (clientTime > existing.updatedAt) {
        await this.prisma.pricingRule.delete({ where: { id } });
        return { entityId: id, status: 'SUCCESS' };
      }
      return {
        entityId: id,
        status: 'CONFLICT',
        serverVersion: this.serializePricingRule(existing),
      };
    }
    const data = this.parsePricingRulePayload(op.payload);
    if (!existing) {
      await this.prisma.pricingRule.create({
        data: { ...data, id, tenantId, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    if (clientTime > existing.updatedAt) {
      await this.prisma.pricingRule.update({
        where: { id },
        data: { ...data, updatedAt: clientTime },
      });
      return { entityId: id, status: 'SUCCESS' };
    }
    return {
      entityId: id,
      status: 'CONFLICT',
      serverVersion: this.serializePricingRule(existing),
    };
  }

  private parsePricingRulePayload(p: Record<string, unknown>) {
    return {
      name: String(p.name),
      type: p.type as PricingRuleType,
      config: p.config as object,
    };
  }

  private serializePricingRule(row: import('@prisma/client').PricingRule): Record<string, unknown> {
    return { ...row, updatedAt: row.updatedAt.toISOString(), createdAt: row.createdAt.toISOString() };
  }
}
