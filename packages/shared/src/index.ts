/** Shared enums and DTO shapes used by API and mobile. */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum PricingRuleType {
  FIXED = 'FIXED',
  AMPERE_BASED = 'AMPERE_BASED',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
}

export type FixedPricingConfig = { monthlyAmount: number };
export type AmperePricingConfig = { ratePerAmpere: number; baseAmperage: number };

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

export type SyncEntityType =
  | 'customer'
  | 'invoice'
  | 'payment'
  | 'subscription'
  | 'pricing_rule';

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncBatchOperation {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  payload: Record<string, unknown>;
  updatedAt: string;
}

export type SyncResultStatus = 'SUCCESS' | 'CONFLICT' | 'ERROR';

export interface SyncBatchResultItem {
  entityId: string;
  status: SyncResultStatus;
  serverVersion?: Record<string, unknown>;
  error?: string;
}
