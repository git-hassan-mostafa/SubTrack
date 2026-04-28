import { PaymentMethod } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
