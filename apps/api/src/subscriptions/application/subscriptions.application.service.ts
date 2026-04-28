import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.subscription.findMany({
      where: { tenantId },
      include: { customer: true, pricingRule: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(tenantId: string, id: string) {
    const row = await this.prisma.subscription.findFirst({
      where: { id, tenantId },
      include: { customer: true, pricingRule: true },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async create(
    tenantId: string,
    data: {
      customerId: string;
      planName: string;
      status: import('@prisma/client').SubscriptionStatus;
      startDate: Date;
      endDate?: Date | null;
      pricingRuleId: string;
      customRate?: number | null;
    },
  ) {
    await this.assertRefs(tenantId, data.customerId, data.pricingRuleId);
    return this.prisma.subscription.create({
      data: {
        tenantId,
        customerId: data.customerId,
        planName: data.planName,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        pricingRuleId: data.pricingRuleId,
        customRate: data.customRate ?? null,
      },
      include: { customer: true, pricingRule: true },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<{
      customerId: string;
      planName: string;
      status: import('@prisma/client').SubscriptionStatus;
      startDate: Date;
      endDate: Date | null;
      pricingRuleId: string;
      customRate: number | null;
    }>,
  ) {
    const existing = await this.getById(tenantId, id);
    const customerId = data.customerId ?? existing.customerId;
    const pricingRuleId = data.pricingRuleId ?? existing.pricingRuleId;
    await this.assertRefs(tenantId, customerId, pricingRuleId);
    return this.prisma.subscription.update({
      where: { id },
      data,
      include: { customer: true, pricingRule: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return this.prisma.subscription.delete({ where: { id } });
  }

  private async assertRefs(tenantId: string, customerId: string, pricingRuleId: string) {
    const [c, p] = await Promise.all([
      this.prisma.customer.findFirst({ where: { id: customerId, tenantId } }),
      this.prisma.pricingRule.findFirst({ where: { id: pricingRuleId, tenantId } }),
    ]);
    if (!c || !p) {
      throw new BadRequestException('customerId or pricingRuleId invalid for tenant');
    }
  }
}
