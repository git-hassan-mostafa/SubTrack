import { Module } from '@nestjs/common';
import { TenantsController } from './presentation/tenants.controller';
import { TenantService } from './application/tenant.service';
import { PrismaTenantRepository } from './infrastructure/prisma-tenant.repository';
import { TENANT_REPOSITORY } from './domain/tenant.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantsController],
  providers: [
    {
      provide: TENANT_REPOSITORY,
      useClass: PrismaTenantRepository,
    },
    TenantService,
  ],
  exports: [TenantService],
})
export class TenantsModule {}
