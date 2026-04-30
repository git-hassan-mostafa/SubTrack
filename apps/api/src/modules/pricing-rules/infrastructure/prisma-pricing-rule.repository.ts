import { Injectable } from '@nestjs/common';
import { PricingRuleRepository } from '../domain/pricing-rule.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PricingRule } from '@prisma/client';

@Injectable()
export class PrismaPricingRuleRepository implements PricingRuleRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, tenantId: string): Promise<PricingRule | null> {
    const p = await this.prisma.pricingRule.findFirst({ where: { id, tenantId } });
    return p;
  }

  async findAll(tenantId: string): Promise<PricingRule[]> {
    const rules = await this.prisma.pricingRule.findMany({ where: { tenantId } });
    return rules;
  }

  async create(data: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    const p = await this.prisma.pricingRule.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type,
        basePrice: data.basePrice,
        pricePerAmpere: data.pricePerAmpere,
      },
    });
    return p;
  }

  async update(
    id: string,
    data: Partial<Omit<PricingRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<PricingRule> {
    const p = await this.prisma.pricingRule.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        basePrice: data.basePrice,
        pricePerAmpere: data.pricePerAmpere,
      },
    });
    return p;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.pricingRule.deleteMany({ where: { id, tenantId } });
  }
}
