import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';
import { PaymentsController } from './presentation/payments.controller';
import { PrismaPaymentRepository } from './infrastructure/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './domain/payment.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
    PaymentService,
  ],
  exports: [PaymentService, PAYMENT_REPOSITORY],
})
export class PaymentsModule {}
