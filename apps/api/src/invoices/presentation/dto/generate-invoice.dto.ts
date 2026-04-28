import { IsUUID } from 'class-validator';

export class GenerateInvoiceDto {
  @IsUUID()
  subscriptionId!: string;
}
