import type { Tenant } from '@prisma/client';

export interface CreateTenantInput {
  companyName: string;
}

export interface TenantRepositoryPort {
  create(data: CreateTenantInput): Promise<Tenant>;
}
