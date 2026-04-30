import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import type { ICustomerRepository } from '../../domain/repositories';
import type { CustomerEntity } from '../../domain/entities';
import { CustomerStatus } from '@/src/domain';

/**
 * SQLite implementation of ICustomerRepository.
 * All writes go to SQLite first, then queue for sync.
 */
export class SQLiteCustomerRepository implements ICustomerRepository {
  async findAll(): Promise<CustomerEntity[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CustomerEntity>(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    return rows;
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CustomerEntity>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async create(
    data: Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomerEntity> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    const customer: CustomerEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO customers (id, tenantId, name, phone, address, latitude, longitude, locationAccuracy, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer.id,
        customer.tenantId,
        customer.name,
        customer.phone,
        customer.address,
        customer.latitude,
        customer.longitude,
        customer.locationAccuracy,
        customer.status,
        customer.createdAt,
        customer.updatedAt,
      ]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['customer', id, 'CREATE', JSON.stringify(customer), now, 'PENDING']
    );

    return customer;
  }

  async update(id: string, data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const existing = await this.findById(id);
    if (!existing) throw new Error('Customer not found');

    const updated: CustomerEntity = { ...existing, ...data, updatedAt: now };

    await db.runAsync(
      `UPDATE customers SET name=?, phone=?, address=?, latitude=?, longitude=?, locationAccuracy=?, status=?, updatedAt=?
       WHERE id=?`,
      [
        updated.name,
        updated.phone,
        updated.address,
        updated.latitude,
        updated.longitude,
        updated.locationAccuracy,
        updated.status,
        updated.updatedAt,
        id,
      ]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['customer', id, 'UPDATE', JSON.stringify(updated), now, 'PENDING']
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const existing = await this.findById(id);
    if (!existing) throw new Error('Customer not found');

    // Soft delete — set status to INACTIVE
    await db.runAsync(
      `UPDATE customers SET status=?, updatedAt=? WHERE id=?`,
      [CustomerStatus.INACTIVE, now, id]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['customer', id, 'UPDATE', JSON.stringify({ ...existing, status: CustomerStatus.INACTIVE, updatedAt: now }), now, 'PENDING']
    );
  }

  async upsertFromServer(customer: CustomerEntity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO customers (id, tenantId, name, phone, address, latitude, longitude, locationAccuracy, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer.id,
        customer.tenantId,
        customer.name,
        customer.phone,
        customer.address,
        customer.latitude,
        customer.longitude,
        customer.locationAccuracy,
        customer.status,
        customer.createdAt,
        customer.updatedAt,
      ]
    );
  }
}
