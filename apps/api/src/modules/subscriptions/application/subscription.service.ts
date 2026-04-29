import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from '../domain/subscription.repository';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../presentation/dto/subscription.dto';
import { Prisma, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(SUBSCRIPTION_REPOSITORY) private readonly subRepo: SubscriptionRepository) {}

  async findAll(tenantId: string) {
    return this.subRepo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const sub = await this.subRepo.findById(id, tenantId);
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async create(tenantId: string, dto: CreateSubscriptionDto) {
    return this.subRepo.create({
      tenantId,
      customerId: dto.customerId,
      pricingRuleId: dto.pricingRuleId,
      planName: dto.planName,
      amperes: new Prisma.Decimal(dto.amperes as number),
      customRate: new Prisma.Decimal(dto.customRate as number),
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateSubscriptionDto) {
    await this.findById(id, tenantId); // checks existence and ownership
    return this.subRepo.update(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  async cancel(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.subRepo.updateStatus(id, tenantId, SubscriptionStatus.CANCELLED);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.subRepo.delete(id, tenantId);
  }
}
