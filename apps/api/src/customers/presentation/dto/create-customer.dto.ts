import { CustomerStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/)
  phone!: string;

  @IsString()
  @MinLength(1)
  address!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  locationAccuracy?: number;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
