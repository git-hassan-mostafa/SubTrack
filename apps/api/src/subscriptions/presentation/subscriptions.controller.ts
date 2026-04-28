import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { SubscriptionsApplicationService } from '../application/subscriptions.application.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsApplicationService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.subs.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.subs.getById(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateSubscriptionDto) {
    return this.subs.create(user.tenantId, {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    const data: Parameters<SubscriptionsApplicationService['update']>[2] = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) {
      data.endDate = dto.endDate === null ? null : new Date(dto.endDate);
    }
    return this.subs.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.subs.remove(user.tenantId, id);
  }
}
