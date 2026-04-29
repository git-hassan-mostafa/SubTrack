import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from '../application/payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@subtrack/shared';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  create(@CurrentUser() user: any, @Body() createDto: CreatePaymentDto) {
    return this.paymentService.record(user.tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll(@CurrentUser() user: any) {
    return this.paymentService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentService.findById(id, user.tenantId);
  }
}
