import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PricingRuleService } from '../application/pricing-rule.service';
import { CreatePricingRuleDto, UpdatePricingRuleDto } from './dto/pricing-rule.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@subtrack/shared';

@Controller('pricing-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingRulesController {
  constructor(private readonly ruleService: PricingRuleService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  create(@CurrentUser() user: any, @Body() createDto: CreatePricingRuleDto) {
    return this.ruleService.create(user.tenantId, createDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAll(@CurrentUser() user: any) {
    return this.ruleService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ruleService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateDto: UpdatePricingRuleDto) {
    return this.ruleService.update(id, user.tenantId, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ruleService.delete(id, user.tenantId);
  }
}
