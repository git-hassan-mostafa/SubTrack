import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PricingRulesApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.pricingRule.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(tenantId: string, id: string) {
    const row = await this.prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException();
    return row;
  }

  create(tenantId: string, data: { name: string; type: import('@prisma/client').PricingRuleType; config: object }) {
    return this.prisma.pricingRule.create({
      data: { tenantId, name: data.name, type: data.type, config: data.config },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<{ name: string; type: import('@prisma/client').PricingRuleType; config: object }>,
  ) {
    await this.getById(tenantId, id);
    return this.prisma.pricingRule.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return this.prisma.pricingRule.delete({ where: { id } });
  }
}
