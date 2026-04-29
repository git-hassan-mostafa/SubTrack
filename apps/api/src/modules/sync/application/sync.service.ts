import { Injectable, Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../customers/domain/customer.repository';
import { INVOICE_REPOSITORY, InvoiceRepository } from '../../invoices/domain/invoice.repository';
import { PAYMENT_REPOSITORY, PaymentRepository } from '../../payments/domain/payment.repository';
import { SUBSCRIPTION_REPOSITORY, SubscriptionRepository } from '../../subscriptions/domain/subscription.repository';
import { compareDates } from '@subtrack/shared';
import { InvoiceStatus, SubscriptionStatus } from '@subtrack/shared';

interface SyncOperation {
  entityType: string;
  entityId: string;
  operation: string;
  payload: Record<string, unknown>;
  updatedAt: string;
}

interface SyncResult {
  entityId: string;
  status: 'SUCCESS' | 'CONFLICT' | 'ERROR';
  serverVersion?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class SyncService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository,
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async processBatch(tenantId: string, operations: SyncOperation[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const op of operations) {
      try {
        const result = await this.processOperation(tenantId, op);
        results.push(result);
      } catch (error) {
        results.push({
          entityId: op.entityId,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async processOperation(tenantId: string, op: SyncOperation): Promise<SyncResult> {
    switch (op.entityType) {
      case 'customer':
        return this.processCustomerOp(tenantId, op);
      case 'invoice':
        return this.processInvoiceOp(tenantId, op);
      case 'payment':
        return this.processPaymentOp(tenantId, op);
      case 'subscription':
        return this.processSubscriptionOp(tenantId, op);
      default:
        return {
          entityId: op.entityId,
          status: 'ERROR',
          error: `Unknown entity type: ${op.entityType}`,
        };
    }
  }

  private async processCustomerOp(tenantId: string, op: SyncOperation): Promise<SyncResult> {
    const existing = await this.customerRepository.findById(op.entityId, tenantId);

    if (!existing) {
      await this.customerRepository.create({
        id: op.entityId,
        tenantId,
        name: op.payload['name'] as string,
        phone: op.payload['phone'] as string,
        address: op.payload['address'] as string,
        latitude: op.payload['latitude'] as number | null,
        longitude: op.payload['longitude'] as number | null,
        locationAccuracy: op.payload['locationAccuracy'] as number | null,
        status: (op.payload['status'] as string) ?? 'ACTIVE',
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    if (compareDates(op.updatedAt, existing.updatedAt.toISOString()) > 0) {
      await this.customerRepository.update(op.entityId, {
        name: op.payload['name'] as string,
        phone: op.payload['phone'] as string,
        address: op.payload['address'] as string,
        latitude: op.payload['latitude'] as number | null,
        longitude: op.payload['longitude'] as number | null,
        locationAccuracy: op.payload['locationAccuracy'] as number | null,
        status: op.payload['status'] as string,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    return {
      entityId: op.entityId,
      status: 'CONFLICT',
      serverVersion: existing as unknown as Record<string, unknown>,
    };
  }

  private async processInvoiceOp(tenantId: string, op: SyncOperation): Promise<SyncResult> {
    const existing = await this.invoiceRepository.findById(op.entityId, tenantId);

    if (!existing) {
      await this.invoiceRepository.create({
        id: op.entityId,
        tenantId,
        customerId: op.payload['customerId'] as string,
        subscriptionId: op.payload['subscriptionId'] as string,
        invoiceNumber: op.payload['invoiceNumber'] as string,
        amount: op.payload['amount'] as number,
        status: (op.payload['status'] as InvoiceStatus) ?? InvoiceStatus.PENDING,
        dueDate: new Date(op.payload['dueDate'] as string),
        issuedDate: new Date(op.payload['issuedDate'] as string),
        notes: op.payload['notes'] as string | null ?? null,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    if (compareDates(op.updatedAt, existing.updatedAt.toISOString()) > 0) {
      await this.invoiceRepository.update(op.entityId, {
        notes: op.payload['notes'] as string | undefined,
        status: op.payload['status'] as InvoiceStatus,
        paidDate: op.payload['paidDate'] ? new Date(op.payload['paidDate'] as string) : null,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    return {
      entityId: op.entityId,
      status: 'CONFLICT',
      serverVersion: existing as unknown as Record<string, unknown>,
    };
  }

  private async processPaymentOp(tenantId: string, op: SyncOperation): Promise<SyncResult> {
    const existing = await this.paymentRepository.findById(op.entityId, tenantId);

    if (!existing) {
      await this.paymentRepository.create({
        id: op.entityId,
        tenantId,
        invoiceId: op.payload['invoiceId'] as string,
        amount: op.payload['amount'] as number,
        method: op.payload['method'] as string,
        referenceNumber: op.payload['referenceNumber'] as string | null ?? null,
        paymentDate: new Date(op.payload['paymentDate'] as string),
        notes: op.payload['notes'] as string | null ?? null,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    if (compareDates(op.updatedAt, existing.updatedAt.toISOString()) > 0) {
      // Payments are immutable once created — treat as success
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    return {
      entityId: op.entityId,
      status: 'CONFLICT',
      serverVersion: existing as unknown as Record<string, unknown>,
    };
  }

  private async processSubscriptionOp(tenantId: string, op: SyncOperation): Promise<SyncResult> {
    const existing = await this.subscriptionRepository.findById(op.entityId, tenantId);

    if (!existing) {
      await this.subscriptionRepository.create({
        id: op.entityId,
        tenantId,
        customerId: op.payload['customerId'] as string,
        pricingRuleId: op.payload['pricingRuleId'] as string,
        planName: (op.payload['planName'] as string) ?? '',
        status: (op.payload['status'] as SubscriptionStatus) ?? SubscriptionStatus.ACTIVE,
        amperes: op.payload['amperes'] as number | null ?? null,
        customRate: op.payload['customRate'] as number | null ?? null,
        startDate: new Date(op.payload['startDate'] as string),
        endDate: op.payload['endDate'] ? new Date(op.payload['endDate'] as string) : null,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    if (compareDates(op.updatedAt, existing.updatedAt.toISOString()) > 0) {
      await this.subscriptionRepository.update(op.entityId, {
        planName: op.payload['planName'] as string,
        status: op.payload['status'] as SubscriptionStatus,
        customRate: op.payload['customRate'] as number | null ?? null,
        endDate: op.payload['endDate'] ? new Date(op.payload['endDate'] as string) : null,
      });
      return { entityId: op.entityId, status: 'SUCCESS' };
    }

    return {
      entityId: op.entityId,
      status: 'CONFLICT',
      serverVersion: existing as unknown as Record<string, unknown>,
    };
  }
}
