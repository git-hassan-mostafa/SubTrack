import { Module } from '@nestjs/common';
import { SyncBatchApplicationService } from './application/sync-batch.application.service';
import { SyncController } from './presentation/sync.controller';

@Module({
  controllers: [SyncController],
  providers: [SyncBatchApplicationService],
})
export class SyncModule {}
