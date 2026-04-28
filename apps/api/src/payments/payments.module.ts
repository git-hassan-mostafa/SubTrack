import { Module } from '@nestjs/common';
import { MessagingModule } from '../messaging/messaging.module';
import { PaymentsApplicationService } from './application/payments.application.service';
import { PaymentsController } from './presentation/payments.controller';

@Module({
  imports: [MessagingModule],
  controllers: [PaymentsController],
  providers: [PaymentsApplicationService],
})
export class PaymentsModule {}
