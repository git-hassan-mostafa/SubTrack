import {
  UserRole,
  CustomerStatus,
  SubscriptionStatus,
  PricingType,
  InvoiceStatus,
  PaymentMethod,
  SyncOperation,
  SyncStatus,
} from './enums';

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

export interface Tenant {
  id: string;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  tenantId: string;
  name: string;
  type: PricingType;
  basePrice: number;
  pricePerAmpere: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  pricingRuleId: string;
  planName: string;
  status: SubscriptionStatus;
  amperes: number | null;
  customRate: number | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  issuedDate: Date;
  dueDate: Date;
  paidDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string | null;
  paymentDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncQueue {
  id: string;
  tenantId: string;
  entityName: string;
  entityId: string;
  operation: SyncOperation;
  payload: string | null;
  status: SyncStatus;
  retryCount: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}
