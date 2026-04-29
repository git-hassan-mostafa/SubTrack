/**
 * Repository interfaces — domain layer contracts.
 * No framework imports. These are implemented by the data layer.
 */

import type {
  CustomerEntity,
  InvoiceEntity,
  PaymentEntity,
  SubscriptionEntity,
  PricingRuleEntity,
  SyncQueueItem,
} from './entities';

export interface ICustomerRepository {
  findAll(): Promise<CustomerEntity[]>;
  findById(id: string): Promise<CustomerEntity | null>;
  create(customer: Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerEntity>;
  update(id: string, data: Partial<CustomerEntity>): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
  upsertFromServer(customer: CustomerEntity): Promise<void>;
}

export interface IInvoiceRepository {
  findAll(statusFilter?: string): Promise<InvoiceEntity[]>;
  findById(id: string): Promise<InvoiceEntity | null>;
  findByCustomer(customerId: string): Promise<InvoiceEntity[]>;
  create(invoice: Omit<InvoiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceEntity>;
  update(id: string, data: Partial<InvoiceEntity>): Promise<InvoiceEntity>;
  upsertFromServer(invoice: InvoiceEntity): Promise<void>;
}

export interface IPaymentRepository {
  findAll(invoiceId?: string): Promise<PaymentEntity[]>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByCustomer(customerId: string): Promise<PaymentEntity[]>;
  create(payment: Omit<PaymentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentEntity>;
  sumByInvoice(invoiceId: string): Promise<number>;
  upsertFromServer(payment: PaymentEntity): Promise<void>;
}

export interface ISubscriptionRepository {
  findAll(): Promise<SubscriptionEntity[]>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  findByCustomer(customerId: string): Promise<SubscriptionEntity[]>;
  create(sub: Omit<SubscriptionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionEntity>;
  update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity>;
  upsertFromServer(sub: SubscriptionEntity): Promise<void>;
}

export interface IPricingRuleRepository {
  findAll(): Promise<PricingRuleEntity[]>;
  findById(id: string): Promise<PricingRuleEntity | null>;
  upsertFromServer(rule: PricingRuleEntity): Promise<void>;
}

export interface ISyncQueueRepository {
  addToQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void>;
  getPending(): Promise<SyncQueueItem[]>;
  markAsSyncing(ids: number[]): Promise<void>;
  markAsSuccess(ids: number[]): Promise<void>;
  markAsFailed(id: number, error: string): Promise<void>;
  getPendingCount(): Promise<number>;
  clearAll(): Promise<void>;
}
