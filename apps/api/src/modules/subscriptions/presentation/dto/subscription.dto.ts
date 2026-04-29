import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { SubscriptionStatus } from '@subtrack/shared';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  pricingRuleId!: string;

  @IsString()
  @IsNotEmpty()
  planName!: string;

  @IsOptional()
  @IsNumber()
  amperes?: number;

  @IsOptional()
  @IsNumber()
  customRate?: number;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  pricingRuleId?: string;

  @IsOptional()
  @IsString()
  planName?: string;

  @IsOptional()
  @IsNumber()
  amperes?: number;

  @IsOptional()
  @IsNumber()
  customRate?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
