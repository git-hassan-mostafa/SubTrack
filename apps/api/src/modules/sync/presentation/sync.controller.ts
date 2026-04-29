import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { SyncService } from '../application/sync.service';
import { SyncBatchDto } from './dto/sync.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch')
  async processBatch(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncBatchDto) {
    const results = await this.syncService.processBatch(user.tenantId, dto.operations);
    return { results };
  }
}
