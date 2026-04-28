import { SubscriptionStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  planName?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsUUID()
  pricingRuleId?: string;

  @IsOptional()
  @IsNumber()
  customRate?: number | null;
}
