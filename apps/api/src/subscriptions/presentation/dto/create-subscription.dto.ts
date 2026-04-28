import { SubscriptionStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  customerId!: string;

  @IsString()
  @MinLength(1)
  planName!: string;

  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsUUID()
  pricingRuleId!: string;

  @IsOptional()
  @IsNumber()
  customRate?: number;
}
