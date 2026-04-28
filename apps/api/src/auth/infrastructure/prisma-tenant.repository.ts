import { Injectable } from '@nestjs/common';
import type { Tenant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateTenantInput, TenantRepositoryPort } from '../domain/tenant.repository.port';

@Injectable()
export class PrismaTenantRepository implements TenantRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTenantInput): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }
}
