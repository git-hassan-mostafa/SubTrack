import { PricingType } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreatePricingRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(PricingType)
  type!: PricingType;

  @IsNumber()
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  pricePerAmpere?: number;
}

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PricingType)
  type?: PricingType;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  pricePerAmpere?: number;
}
