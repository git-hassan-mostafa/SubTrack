import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { SyncBatchApplicationService } from '../application/sync-batch.application.service';
import { SyncBatchDto } from './dto/sync-batch.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncBatchApplicationService) {}

  @Post('batch')
  batch(@CurrentUser() user: RequestUser, @Body() dto: SyncBatchDto) {
    return this.sync.process(user.tenantId, dto.operations);
  }
}
