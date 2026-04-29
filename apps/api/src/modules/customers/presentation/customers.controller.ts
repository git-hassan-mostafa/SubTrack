import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomerService } from '../application/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentService } from '../../payments/application/payment.service';
import { UserRole } from '@subtrack/shared';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  create(@CurrentUser() user: any, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(user.tenantId, createCustomerDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll(@CurrentUser() user: any) {
    return this.customerService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerService.findById(id, user.tenantId);
  }

  @Get(':id/debt')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  getDebt(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentService.getDebtSummary(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, user.tenantId, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customerService.delete(id, user.tenantId);
  }
}
