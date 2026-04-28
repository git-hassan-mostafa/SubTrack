import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { CustomerDebtApplicationService } from '../application/customer-debt.application.service';
import { CustomersApplicationService } from '../application/customers.application.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customers: CustomersApplicationService,
    private readonly debt: CustomerDebtApplicationService,
  ) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.customers.list(user.tenantId);
  }

  @Get(':customerId/debt')
  debt(@CurrentUser() user: RequestUser, @Param('customerId') customerId: string) {
    return this.debt.getDebt(user.tenantId, customerId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.customers.getById(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.customers.remove(user.tenantId, id);
  }
}
