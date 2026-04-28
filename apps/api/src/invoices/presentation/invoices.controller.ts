import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { InvoicesApplicationService } from '../application/invoices.application.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { PatchInvoiceDto } from './dto/patch-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesApplicationService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('status') status?: InvoiceStatus) {
    return this.invoices.list(user.tenantId, status);
  }

  @Post('generate')
  generate(@CurrentUser() user: RequestUser, @Body() dto: GenerateInvoiceDto) {
    return this.invoices.generate(user.tenantId, dto.subscriptionId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.invoices.getById(user.tenantId, id);
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: PatchInvoiceDto,
  ) {
    return this.invoices.patch(user.tenantId, id, {
      notes: dto.notes,
      ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
    });
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.invoices.cancel(user.tenantId, id);
  }
}
