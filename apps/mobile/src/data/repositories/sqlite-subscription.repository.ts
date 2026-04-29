import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import type { ISubscriptionRepository } from '../../domain/repositories';
import type { SubscriptionEntity } from '../../domain/entities';

export class SQLiteSubscriptionRepository implements ISubscriptionRepository {
  async findAll(): Promise<SubscriptionEntity[]> {
    const db = await getDatabase();
    return db.getAllAsync<SubscriptionEntity>(
      'SELECT * FROM subscriptions ORDER BY startDate DESC'
    );
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SubscriptionEntity>(
      'SELECT * FROM subscriptions WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async findByCustomer(customerId: string): Promise<SubscriptionEntity[]> {
    const db = await getDatabase();
    return db.getAllAsync<SubscriptionEntity>(
      'SELECT * FROM subscriptions WHERE customerId = ? ORDER BY startDate DESC',
      [customerId]
    );
  }

  async create(
    data: Omit<SubscriptionEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SubscriptionEntity> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    const sub: SubscriptionEntity = { ...data, id, createdAt: now, updatedAt: now };

    await db.runAsync(
      `INSERT INTO subscriptions (id, tenantId, customerId, planName, status, startDate, endDate, pricingRuleId, amperes, customRate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub.id, sub.tenantId, sub.customerId, sub.planName, sub.status,
        sub.startDate, sub.endDate, sub.pricingRuleId, sub.amperes ?? null, sub.customRate ?? null,
        sub.createdAt, sub.updatedAt,
      ]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['subscription', id, 'CREATE', JSON.stringify(sub), now, 'PENDING']
    );

    return sub;
  }

  async update(id: string, data: Partial<SubscriptionEntity>): Promise<SubscriptionEntity> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const existing = await this.findById(id);
    if (!existing) throw new Error('Subscription not found');

    const updated: SubscriptionEntity = { ...existing, ...data, updatedAt: now };

    await db.runAsync(
      `UPDATE subscriptions SET planName=?, status=?, endDate=?, pricingRuleId=?, amperes=?, customRate=?, updatedAt=? WHERE id=?`,
      [updated.planName, updated.status, updated.endDate, updated.pricingRuleId, updated.amperes ?? null, updated.customRate ?? null, updated.updatedAt, id]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['subscription', id, 'UPDATE', JSON.stringify(updated), now, 'PENDING']
    );

    return updated;
  }

  async upsertFromServer(sub: SubscriptionEntity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO subscriptions (id, tenantId, customerId, planName, status, startDate, endDate, pricingRuleId, amperes, customRate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub.id, sub.tenantId, sub.customerId, sub.planName, sub.status,
        sub.startDate, sub.endDate, sub.pricingRuleId, sub.amperes ?? null, sub.customRate ?? null,
        sub.createdAt, sub.updatedAt,
      ]
    );
  }
}
