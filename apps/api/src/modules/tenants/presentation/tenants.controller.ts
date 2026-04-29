import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantService } from '../application/tenant.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantService: TenantService) {}

  /** Returns the authenticated user's own tenant info. */
  @Get('me')
  getMyTenant(@CurrentUser() user: any) {
    return this.tenantService.findById(user.tenantId);
  }
}
