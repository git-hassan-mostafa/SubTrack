import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '@subtrack/shared';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsDateString()
  @IsNotEmpty()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
