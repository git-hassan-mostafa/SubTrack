import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { PaymentsApplicationService } from '../application/payments.application.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsApplicationService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('invoiceId') invoiceId?: string) {
    return this.payments.list(user.tenantId, invoiceId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.payments.getById(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePaymentDto) {
    return this.payments.create(user.tenantId, {
      ...dto,
      paymentDate: new Date(dto.paymentDate),
    });
  }
}
