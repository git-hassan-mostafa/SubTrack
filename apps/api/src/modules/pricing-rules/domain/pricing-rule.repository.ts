import { PricingRule } from '@subtrack/shared';

export const PRICING_RULE_REPOSITORY = 'PRICING_RULE_REPOSITORY';

export interface PricingRuleRepository {
  findById(id: string, tenantId: string): Promise<PricingRule | null>;
  findAll(tenantId: string): Promise<PricingRule[]>;
  create(data: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule>;
  update(id: string, data: Partial<Omit<PricingRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<PricingRule>;
  delete(id: string, tenantId: string): Promise<void>;
}
