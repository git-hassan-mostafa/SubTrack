import { IsArray, ValidateNested, IsString, IsEnum, IsObject, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncOperationDto {
  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsEnum(['CREATE', 'UPDATE', 'DELETE'])
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
