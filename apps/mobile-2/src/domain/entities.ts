/**
 * SQLite row shapes for the mobile app.
 *
 * Field names match the columns defined in `data/database/database.ts`.
 * Dates are ISO-8601 strings because SQLite has no Date type — this is the
 * only intentional divergence from the canonical entities in `@subtrack/shared`.
 * Status/method/type/operation fields use the shared enums, so any mismatch
 * with the api wire format is a compile-time error.
 */
import type {
  CustomerStatus,
  InvoiceStatus,
  PaymentMethod,
  PricingType,
  SubscriptionStatus,
  SyncOperation,
  SyncStatus,
} from '@subtrack/shared';

export interface CustomerEntity {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEntity {
  id: string;
  tenantId: string;
  customerId: string;
  planName: string;
  status: SubscriptionStatus;
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
  status: InvoiceStatus;
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
  method: PaymentMethod;
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
  type: PricingType;
  basePrice: number;
  pricePerAmpere: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: number;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: string;
  createdAt: string;
  status: SyncStatus;
  retryCount: number;
  lastError: string | null;
}
