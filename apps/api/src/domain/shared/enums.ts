/**
 * Sync queue operation type.
 */
export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Sync queue item status.
 */
export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  FAILED = 'FAILED',
}
