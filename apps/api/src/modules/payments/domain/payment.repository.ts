import { Payment } from '@subtrack/shared';

export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY';

export interface PaymentRepository {
  findById(id: string, tenantId: string): Promise<Payment | null>;
  findAll(tenantId: string): Promise<Payment[]>;
  findByInvoiceId(invoiceId: string, tenantId: string): Promise<Payment[]>;
  create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Payment>;
}
