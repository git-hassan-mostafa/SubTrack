import { BadRequestException, Injectable } from '@nestjs/common';
import { PricingRuleType } from '@prisma/client';

export interface SubscriptionPricingInput {
  customRate: number | null | undefined;
}

export interface PricingRuleInput {
  type: PricingRuleType;
  config: unknown;
}

@Injectable()
export class PricingCalculationService {
  /**
   * Pure pricing calculation: customRate wins; else rule-based amount.
   */
  calculateInvoiceAmount(
    subscription: SubscriptionPricingInput,
    rule: PricingRuleInput,
  ): number {
    if (subscription.customRate != null && subscription.customRate !== undefined) {
      return subscription.customRate;
    }
    if (rule.type === PricingRuleType.FIXED) {
      const c = rule.config as { monthlyAmount?: number };
      if (typeof c?.monthlyAmount !== 'number' || Number.isNaN(c.monthlyAmount)) {
        throw new BadRequestException('Invalid FIXED pricing config');
      }
      return c.monthlyAmount;
    }
    if (rule.type === PricingRuleType.AMPERE_BASED) {
      const c = rule.config as { ratePerAmpere?: number; baseAmperage?: number };
      if (
        typeof c?.ratePerAmpere !== 'number' ||
        typeof c?.baseAmperage !== 'number' ||
        Number.isNaN(c.ratePerAmpere) ||
        Number.isNaN(c.baseAmperage)
      ) {
        throw new BadRequestException('Invalid AMPERE_BASED pricing config');
      }
      return c.ratePerAmpere * c.baseAmperage;
    }
    throw new BadRequestException('Unknown pricing rule type');
  }
}
