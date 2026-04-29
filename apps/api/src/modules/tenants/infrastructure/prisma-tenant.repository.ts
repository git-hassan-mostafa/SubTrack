import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../domain/tenant.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Tenant } from '@subtrack/shared';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(t: any): Tenant {
    return {
      id: t.id,
      companyName: t.companyName,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async findById(id: string): Promise<Tenant | null> {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    return t ? this.mapToDomain(t) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany();
    return tenants.map((t) => this.mapToDomain(t));
  }

  async create(data: { companyName: string }): Promise<Tenant> {
    const t = await this.prisma.tenant.create({ data });
    return this.mapToDomain(t);
  }

  async update(id: string, data: { companyName?: string }): Promise<Tenant> {
    const t = await this.prisma.tenant.update({ where: { id }, data });
    return this.mapToDomain(t);
  }
}
