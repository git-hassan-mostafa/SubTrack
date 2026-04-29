import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../domain/subscription.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Subscription, SubscriptionStatus } from '@subtrack/shared';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(s: any): Subscription {
    return {
      id: s.id,
      tenantId: s.tenantId,
      customerId: s.customerId,
      pricingRuleId: s.pricingRuleId,
      planName: s.planName,
      status: s.status as SubscriptionStatus,
      amperes: s.amperes != null ? Number(s.amperes) : null,
      customRate: s.customRate != null ? Number(s.customRate) : null,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Subscription | null> {
    const s = await this.prisma.subscription.findFirst({ where: { id, tenantId } });
    return s ? this.mapToDomain(s) : null;
  }

  async findAll(tenantId: string): Promise<Subscription[]> {
    const subs = await this.prisma.subscription.findMany({ where: { tenantId } });
    return subs.map((s) => this.mapToDomain(s));
  }

  async create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Subscription> {
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
    return this.mapToDomain(s);
  }

  async update(id: string, data: Partial<Omit<Subscription, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<Subscription> {
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
    return this.mapToDomain(s);
  }

  async updateStatus(id: string, tenantId: string, status: SubscriptionStatus): Promise<Subscription> {
    const s = await this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
    return this.mapToDomain(s);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.subscription.deleteMany({ where: { id, tenantId } });
  }
}
