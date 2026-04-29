import { Module } from '@nestjs/common';
import { PricingRuleService } from './application/pricing-rule.service';
import { PricingService } from './domain/pricing.service';
import { PricingRulesController } from './presentation/pricing-rules.controller';
import { PrismaPricingRuleRepository } from './infrastructure/prisma-pricing-rule.repository';
import { PRICING_RULE_REPOSITORY } from './domain/pricing-rule.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PricingRulesController],
  providers: [
    {
      provide: PRICING_RULE_REPOSITORY,
      useClass: PrismaPricingRuleRepository,
    },
    PricingRuleService,
    PricingService, // Pure domain logic
  ],
  exports: [PricingRuleService, PricingService],
})
export class PricingRulesModule {}
