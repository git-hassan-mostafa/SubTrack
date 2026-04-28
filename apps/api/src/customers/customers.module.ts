import { Module } from '@nestjs/common';
import { CustomerDebtApplicationService } from './application/customer-debt.application.service';
import { CustomersApplicationService } from './application/customers.application.service';
import { CustomersController } from './presentation/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [CustomersApplicationService, CustomerDebtApplicationService],
  exports: [CustomersApplicationService],
})
export class CustomersModule {}
