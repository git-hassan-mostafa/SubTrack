import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InvoiceService } from '../application/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@subtrack/shared';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  generate(@CurrentUser() user: any, @Body() createDto: CreateInvoiceDto) {
    return this.invoiceService.generate(user.tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll(@CurrentUser() user: any) {
    return this.invoiceService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoiceService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, user.tenantId, updateDto);
  }

  @Delete(':id/cancel')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoiceService.cancel(id, user.tenantId);
  }
}
