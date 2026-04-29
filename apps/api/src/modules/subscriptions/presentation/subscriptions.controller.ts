import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../application/subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  create(@CurrentUser() user: any, @Body() createDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(user.tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll(@CurrentUser() user: any) {
    return this.subscriptionService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, user.tenantId, updateDto);
  }

  @Delete(':id/cancel')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionService.cancel(id, user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionService.delete(id, user.tenantId);
  }
}
