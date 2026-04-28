import { PricingRuleType } from '@prisma/client';
import { IsEnum, IsObject, IsString, MinLength } from 'class-validator';

export class CreatePricingRuleDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(PricingRuleType)
  type!: PricingRuleType;

  @IsObject()
  config!: Record<string, unknown>;
}
