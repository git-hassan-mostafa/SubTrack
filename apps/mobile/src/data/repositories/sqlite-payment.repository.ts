import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import type { IPaymentRepository } from '../../domain/repositories';
import type { PaymentEntity } from '../../domain/entities';

export class SQLitePaymentRepository implements IPaymentRepository {
  async findAll(invoiceId?: string): Promise<PaymentEntity[]> {
    const db = await getDatabase();
    if (invoiceId) {
      return db.getAllAsync<PaymentEntity>(
        'SELECT * FROM payments WHERE invoiceId = ? ORDER BY paymentDate DESC',
        [invoiceId]
      );
    }
    return db.getAllAsync<PaymentEntity>(
      'SELECT * FROM payments ORDER BY paymentDate DESC'
    );
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<PaymentEntity>(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async findByCustomer(customerId: string): Promise<PaymentEntity[]> {
    const db = await getDatabase();
    return db.getAllAsync<PaymentEntity>(
      `SELECT p.* FROM payments p
       INNER JOIN invoices i ON p.invoiceId = i.id
       WHERE i.customerId = ?
       ORDER BY p.paymentDate DESC`,
      [customerId]
    );
  }

  async create(
    data: Omit<PaymentEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentEntity> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    const payment: PaymentEntity = { ...data, id, createdAt: now, updatedAt: now };

    await db.runAsync(
      `INSERT INTO payments (id, tenantId, invoiceId, amount, method, referenceNumber, paymentDate, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id, payment.tenantId, payment.invoiceId, payment.amount,
        payment.method, payment.referenceNumber, payment.paymentDate,
        payment.notes, payment.createdAt, payment.updatedAt,
      ]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['payment', id, 'CREATE', JSON.stringify(payment), now, 'PENDING']
    );

    return payment;
  }

  async sumByInvoice(invoiceId: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoiceId = ?',
      [invoiceId]
    );
    return result?.total ?? 0;
  }

  async upsertFromServer(payment: PaymentEntity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO payments (id, tenantId, invoiceId, amount, method, referenceNumber, paymentDate, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id, payment.tenantId, payment.invoiceId, payment.amount,
        payment.method, payment.referenceNumber, payment.paymentDate,
        payment.notes, payment.createdAt, payment.updatedAt,
      ]
    );
  }
}
