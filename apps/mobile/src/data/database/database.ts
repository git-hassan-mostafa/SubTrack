import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or initialize the SQLite database.
 * Creates all tables if they don't exist.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('subtrack.db');

  // Enable WAL mode for performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create all tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      locationAccuracy REAL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      planName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      startDate TEXT NOT NULL,
      endDate TEXT,
      pricingRuleId TEXT NOT NULL,
      amperes REAL,
      customRate REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      basePrice REAL NOT NULL DEFAULT 0,
      pricePerAmpere REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      subscriptionId TEXT NOT NULL,
      invoiceNumber TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      dueDate TEXT NOT NULL,
      issuedDate TEXT NOT NULL,
      paidDate TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      invoiceId TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      referenceNumber TEXT,
      paymentDate TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      retryCount INTEGER NOT NULL DEFAULT 0,
      lastError TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_customers_tenantId ON customers(tenantId);
    CREATE INDEX IF NOT EXISTS idx_invoices_tenantId ON invoices(tenantId);
    CREATE INDEX IF NOT EXISTS idx_invoices_customerId ON invoices(customerId);
    CREATE INDEX IF NOT EXISTS idx_payments_invoiceId ON payments(invoiceId);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
  `);

  return db;
}

/**
 * Close the database connection.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
