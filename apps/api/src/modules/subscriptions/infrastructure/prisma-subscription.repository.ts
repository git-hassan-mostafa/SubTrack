import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../domain/subscription.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Subscription, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, tenantId: string): Promise<Subscription | null> {
    const s = await this.prisma.subscription.findFirst({ where: { id, tenantId } });
    return s;
  }

  async findAll(tenantId: string): Promise<Subscription[]> {
    const subs = await this.prisma.subscription.findMany({ where: { tenantId } });
    return subs;
  }

  async create(
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<Subscription> {
    const s = await this.prisma.subscription.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        tenantId: data.tenantId,
        customerId: data.customerId,
        pricingRuleId: data.pricingRuleId,
        planName: data.planName,
        status: data.status,
        amperes: data.amperes,
        customRate: data.customRate,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    return s;
  }

  async update(
    id: string,
    data: Partial<Omit<Subscription, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Subscription> {
    const s = await this.prisma.subscription.update({
      where: { id },
      data: {
        customerId: data.customerId,
        pricingRuleId: data.pricingRuleId,
        planName: data.planName,
        status: data.status,
        amperes: data.amperes,
        customRate: data.customRate,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    return s;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    await this.prisma.subscription.updateMany({
      where: { id, tenantId },
      data: { status },
    });
    const updated = await this.prisma.subscription.findFirst({ where: { id, tenantId } });
    return updated!;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.subscription.deleteMany({ where: { id, tenantId } });
  }
}
