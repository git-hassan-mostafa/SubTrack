/**
 * Domain entity interfaces — clean, framework-agnostic.
 * These mirror the shared types but are defined here for the
 * domain layer to remain independent.
 */

export interface CustomerEntity {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEntity {
  id: string;
  tenantId: string;
  customerId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  pricingRuleId: string;
  amperes: number | null;
  customRate: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceEntity {
  id: string;
  tenantId: string;
  customerId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  issuedDate: string;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: string;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRuleEntity {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  basePrice: number;
  pricePerAmpere: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: number;
  entityType: string;
  entityId: string;
  operation: string;
  payload: string;
  createdAt: string;
  status: string;
  retryCount: number;
  lastError: string | null;
}
