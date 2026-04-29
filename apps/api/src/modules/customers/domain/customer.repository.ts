import { Customer, CustomerStatus } from '@prisma/client';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface CustomerRepository {
  findById(id: string, tenantId: string): Promise<Customer | null>;
  findAll(tenantId: string): Promise<Customer[]>;
  create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<Customer>;
  update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer>;
  delete(id: string, tenantId: string): Promise<void>;
  updateStatus(id: string, tenantId: string, status: CustomerStatus): Promise<Customer>;
}
