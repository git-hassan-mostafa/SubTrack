import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PatchInvoiceDto {
  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
