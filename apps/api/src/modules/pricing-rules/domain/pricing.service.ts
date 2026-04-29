import { Injectable } from '@nestjs/common';
import { PricingRule, PricingType } from '@subtrack/shared';

@Injectable()
export class PricingService {
  /**
   * Pure business logic: calculate total cost based on rule and amperes.
   */
  calculateAmount(rule: PricingRule, amperes?: number | null): number {
    if (rule.type === PricingType.FIXED) {
      return rule.basePrice;
    }

    if (rule.type === PricingType.AMPERE_BASED) {
      const amps = amperes || 0;
      const rate = rule.pricePerAmpere || 0;
      return rule.basePrice + (amps * rate);
    }

    return 0;
  }
}
