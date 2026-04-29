import { Tenant } from '@subtrack/shared';

export const TENANT_REPOSITORY = 'TENANT_REPOSITORY';

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  create(data: { companyName: string }): Promise<Tenant>;
  update(id: string, data: { companyName?: string }): Promise<Tenant>;
}
