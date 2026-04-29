import { Module } from '@nestjs/common';
import { CustomerService } from './application/customer.service';
import { CustomersController } from './presentation/customers.controller';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [CustomersController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
    CustomerService,
  ],
  exports: [CustomerService, CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
