import { Injectable } from '@nestjs/common';
import { PricingRuleRepository } from '../domain/pricing-rule.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PricingRule, PricingType, Prisma } from '@prisma/client';

@Injectable()
export class PrismaPricingRuleRepository implements PricingRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(p: any): PricingRule {
    return {
      id: p.id,
      tenantId: p.tenantId,
      name: p.name,
      type: p.type as PricingType,
      basePrice: new Prisma.Decimal(p.basePrice),
      pricePerAmpere: new Prisma.Decimal(p.pricePerAmpere),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<PricingRule | null> {
    const p = await this.prisma.pricingRule.findFirst({ where: { id, tenantId } });
    return p ? this.mapToDomain(p) : null;
  }

  async findAll(tenantId: string): Promise<PricingRule[]> {
    const rules = await this.prisma.pricingRule.findMany({ where: { tenantId } });
    return rules.map((p) => this.mapToDomain(p));
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
    return this.mapToDomain(p);
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
    return this.mapToDomain(p);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.pricingRule.deleteMany({ where: { id, tenantId } });
  }
}
