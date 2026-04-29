import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_REPOSITORY, TenantRepository } from '../domain/tenant.repository';

@Injectable()
export class TenantService {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: TenantRepository,
  ) {}

  async findById(id: string) {
    const tenant = await this.tenantRepo.findById(id);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findAll() {
    return this.tenantRepo.findAll();
  }

  async create(companyName: string) {
    return this.tenantRepo.create({ companyName });
  }

  async update(id: string, companyName: string) {
    await this.findById(id);
    return this.tenantRepo.update(id, { companyName });
  }
}
