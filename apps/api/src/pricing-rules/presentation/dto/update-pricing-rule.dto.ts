import { PricingRuleType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(PricingRuleType)
  type?: PricingRuleType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
