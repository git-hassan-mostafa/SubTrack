import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { PricingRulesApplicationService } from '../application/pricing-rules.application.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

@Controller('pricing-rules')
export class PricingRulesController {
  constructor(private readonly rules: PricingRulesApplicationService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.rules.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.rules.getById(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePricingRuleDto) {
    return this.rules.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePricingRuleDto,
  ) {
    return this.rules.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.rules.remove(user.tenantId, id);
  }
}
