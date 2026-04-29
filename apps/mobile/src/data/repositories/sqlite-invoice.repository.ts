import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import type { IInvoiceRepository } from '../../domain/repositories';
import type { InvoiceEntity } from '../../domain/entities';

export class SQLiteInvoiceRepository implements IInvoiceRepository {
  async findAll(statusFilter?: string): Promise<InvoiceEntity[]> {
    const db = await getDatabase();
    if (statusFilter) {
      return db.getAllAsync<InvoiceEntity>(
        'SELECT * FROM invoices WHERE status = ? ORDER BY issuedDate DESC',
        [statusFilter]
      );
    }
    return db.getAllAsync<InvoiceEntity>(
      'SELECT * FROM invoices ORDER BY issuedDate DESC'
    );
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<InvoiceEntity>(
      'SELECT * FROM invoices WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async findByCustomer(customerId: string): Promise<InvoiceEntity[]> {
    const db = await getDatabase();
    return db.getAllAsync<InvoiceEntity>(
      'SELECT * FROM invoices WHERE customerId = ? ORDER BY issuedDate DESC',
      [customerId]
    );
  }

  async create(
    data: Omit<InvoiceEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<InvoiceEntity> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    const invoice: InvoiceEntity = { ...data, id, createdAt: now, updatedAt: now };

    await db.runAsync(
      `INSERT INTO invoices (id, tenantId, customerId, subscriptionId, invoiceNumber, amount, status, dueDate, issuedDate, paidDate, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice.id, invoice.tenantId, invoice.customerId, invoice.subscriptionId,
        invoice.invoiceNumber, invoice.amount, invoice.status, invoice.dueDate,
        invoice.issuedDate, invoice.paidDate, invoice.notes, invoice.createdAt, invoice.updatedAt,
      ]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['invoice', id, 'CREATE', JSON.stringify(invoice), now, 'PENDING']
    );

    return invoice;
  }

  async update(id: string, data: Partial<InvoiceEntity>): Promise<InvoiceEntity> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const existing = await this.findById(id);
    if (!existing) throw new Error('Invoice not found');

    const updated: InvoiceEntity = { ...existing, ...data, updatedAt: now };

    await db.runAsync(
      `UPDATE invoices SET status=?, dueDate=?, paidDate=?, notes=?, updatedAt=? WHERE id=?`,
      [updated.status, updated.dueDate, updated.paidDate, updated.notes, updated.updatedAt, id]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['invoice', id, 'UPDATE', JSON.stringify(updated), now, 'PENDING']
    );

    return updated;
  }

  async upsertFromServer(invoice: InvoiceEntity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO invoices (id, tenantId, customerId, subscriptionId, invoiceNumber, amount, status, dueDate, issuedDate, paidDate, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice.id, invoice.tenantId, invoice.customerId, invoice.subscriptionId,
        invoice.invoiceNumber, invoice.amount, invoice.status, invoice.dueDate,
        invoice.issuedDate, invoice.paidDate, invoice.notes, invoice.createdAt, invoice.updatedAt,
      ]
    );
  }
}
