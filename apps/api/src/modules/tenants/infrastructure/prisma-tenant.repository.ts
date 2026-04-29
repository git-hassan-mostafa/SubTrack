import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../domain/tenant.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    return t;
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany();
    return tenants;
  }

  async create(data: { companyName: string }): Promise<Tenant> {
    const t = await this.prisma.tenant.create({ data });
    return t;
  }

  async update(id: string, data: { companyName?: string }): Promise<Tenant> {
    const t = await this.prisma.tenant.update({ where: { id }, data });
    return t;
  }
}
