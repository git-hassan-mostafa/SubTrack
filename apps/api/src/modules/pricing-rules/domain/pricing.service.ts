import { Injectable } from '@nestjs/common';
import { PricingRule, PricingType } from '@prisma/client';

@Injectable()
export class PricingService {
  /**
   * Pure business logic: calculate total cost based on rule and amperes.
   */
  calculateAmount(rule: PricingRule, amperes?: number | null): number {
    if (rule.type === PricingType.FIXED) {
      return Number(rule.basePrice);
    }

    if (rule.type === PricingType.AMPERE_BASED) {
      const amps = amperes || 0;
      const rate = rule.pricePerAmpere || 0;
      return Number(rule.basePrice) + amps * Number(rate);
    }

    return 0;
  }
}
