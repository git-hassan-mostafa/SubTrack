import { getDatabase } from '../database/database';
import type { IPricingRuleRepository } from '../../domain/repositories';
import type { PricingRuleEntity } from '../../domain/entities';

export class SQLitePricingRuleRepository implements IPricingRuleRepository {
  async findAll(): Promise<PricingRuleEntity[]> {
    const db = await getDatabase();
    return db.getAllAsync<PricingRuleEntity>(
      'SELECT * FROM pricing_rules ORDER BY name ASC'
    );
  }

  async findById(id: string): Promise<PricingRuleEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<PricingRuleEntity>(
      'SELECT * FROM pricing_rules WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async upsertFromServer(rule: PricingRuleEntity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO pricing_rules (id, tenantId, name, type, basePrice, pricePerAmpere, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rule.id, rule.tenantId, rule.name, rule.type,
        rule.basePrice, rule.pricePerAmpere ?? null, rule.createdAt, rule.updatedAt,
      ]
    );
  }
}
