import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRICING_RULE_REPOSITORY, PricingRuleRepository } from '../domain/pricing-rule.repository';
import { CreatePricingRuleDto, UpdatePricingRuleDto } from '../presentation/dto/pricing-rule.dto';

@Injectable()
export class PricingRuleService {
  constructor(
    @Inject(PRICING_RULE_REPOSITORY) private readonly ruleRepo: PricingRuleRepository,
  ) {}

  async findAll(tenantId: string) {
    return this.ruleRepo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const rule = await this.ruleRepo.findById(id, tenantId);
    if (!rule) throw new NotFoundException('Pricing rule not found');
    return rule;
  }

  async create(tenantId: string, dto: CreatePricingRuleDto) {
    return this.ruleRepo.create({
      tenantId,
      ...dto,
    });
  }

  async update(id: string, tenantId: string, dto: UpdatePricingRuleDto) {
    await this.findById(id, tenantId); // checks existence and ownership
    return this.ruleRepo.update(id, dto);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.ruleRepo.delete(id, tenantId);
  }
}
