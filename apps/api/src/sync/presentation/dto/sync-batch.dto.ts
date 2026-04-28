import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class SyncOperationDto {
  @IsString()
  @IsIn(['customer', 'invoice', 'payment', 'subscription', 'pricing_rule'])
  entityType!: string;

  @IsUUID()
  entityId!: string;

  @IsString()
  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  operation!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsDateString()
  updatedAt!: string;
}

export class SyncBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}
