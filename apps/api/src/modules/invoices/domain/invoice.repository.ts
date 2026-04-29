import { Invoice, InvoiceStatus } from '@prisma/client';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface InvoiceRepository {
  findById(id: string, tenantId: string): Promise<Invoice | null>;
  findAll(tenantId: string): Promise<Invoice[]>;
  create(
    data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'paidDate'> & { id?: string },
  ): Promise<Invoice>;
  update(
    id: string,
    data: Partial<Omit<Invoice, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Invoice>;
  updateStatus(
    id: string,
    tenantId: string,
    status: InvoiceStatus,
    paidDate?: Date,
  ): Promise<Invoice>;
}
