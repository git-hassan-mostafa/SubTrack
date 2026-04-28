import { CustomerStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsNumber()
  locationAccuracy?: number | null;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
