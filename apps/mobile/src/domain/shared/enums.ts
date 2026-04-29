/**
 * User roles within a tenant organization.
 */
export enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  OPERATOR = 'OPERATOR',
  MANAGER = 'MANAGER',
}

/**
 * Customer activity status.
 */
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

/**
 * Subscription lifecycle status.
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Pricing rule calculation type.
 */
export enum PricingType {
  FIXED = 'FIXED',
  AMPERE_BASED = 'AMPERE_BASED',
}

/**
 * Invoice payment status.
 */
export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment method used by the customer.
 */
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
}

/**
 * Sync queue operation type.
 */
export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Sync queue item status.
 */
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  FAILED = 'FAILED',
}

/**
 * Sync batch result status.
 */
export enum SyncResultStatus {
  SUCCESS = 'SUCCESS',
  CONFLICT = 'CONFLICT',
  ERROR = 'ERROR',
}
