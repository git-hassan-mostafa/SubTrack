import { getDatabase } from '../database/database';
import type { ISyncQueueRepository } from '../../domain/repositories';
import type { SyncQueueItem } from '../../domain/entities';

export class SQLiteSyncQueueRepository implements ISyncQueueRepository {
  async addToQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status, retryCount, lastError)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.entityType, item.entityId, item.operation,
        item.payload, item.createdAt, item.status,
        item.retryCount, item.lastError,
      ]
    );
  }

  async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    return db.getAllAsync<SyncQueueItem>(
      `SELECT * FROM sync_queue WHERE status = 'PENDING' ORDER BY createdAt ASC`
    );
  }

  async markAsSyncing(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE sync_queue SET status = 'SYNCING' WHERE id IN (${placeholders})`,
      ids
    );
  }

  async markAsSuccess(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM sync_queue WHERE id IN (${placeholders})`,
      ids
    );
  }

  async markAsFailed(id: number, error: string): Promise<void> {
    const db = await getDatabase();
    const item = await db.getFirstAsync<SyncQueueItem>(
      'SELECT * FROM sync_queue WHERE id = ?',
      [id]
    );

    if (!item) return;

    const newRetryCount = item.retryCount + 1;
    const newStatus = newRetryCount > 5 ? 'FAILED' : 'PENDING';

    await db.runAsync(
      `UPDATE sync_queue SET status = ?, retryCount = ?, lastError = ? WHERE id = ?`,
      [newStatus, newRetryCount, error, id]
    );
  }

  async getPendingCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status IN ('PENDING', 'SYNCING')`
    );
    return result?.count ?? 0;
  }

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue');
  }
}
