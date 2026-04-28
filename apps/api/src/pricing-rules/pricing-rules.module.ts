import { Module } from '@nestjs/common';
import { PricingCalculationService } from './application/pricing-calculation.service';
import { PricingRulesApplicationService } from './application/pricing-rules.application.service';
import { PricingRulesController } from './presentation/pricing-rules.controller';

@Module({
  controllers: [PricingRulesController],
  providers: [PricingRulesApplicationService, PricingCalculationService],
  exports: [PricingRulesApplicationService, PricingCalculationService],
})
export class PricingRulesModule {}
