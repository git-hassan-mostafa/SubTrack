import { Subscription, SubscriptionStatus } from '@subtrack/shared';

export const SUBSCRIPTION_REPOSITORY = 'SUBSCRIPTION_REPOSITORY';

export interface SubscriptionRepository {
  findById(id: string, tenantId: string): Promise<Subscription | null>;
  findAll(tenantId: string): Promise<Subscription[]>;
  create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Subscription>;
  update(id: string, data: Partial<Omit<Subscription, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<Subscription>;
  updateStatus(id: string, tenantId: string, status: SubscriptionStatus): Promise<Subscription>;
  delete(id: string, tenantId: string): Promise<void>;
}
