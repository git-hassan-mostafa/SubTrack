import { apiClient } from '../api/api-client';
import { SQLiteSyncQueueRepository } from '../repositories/sqlite-sync-queue.repository';
import { SQLiteCustomerRepository } from '../repositories/sqlite-customer.repository';
import { SQLiteInvoiceRepository } from '../repositories/sqlite-invoice.repository';
import { SQLitePaymentRepository } from '../repositories/sqlite-payment.repository';
import { SQLiteSubscriptionRepository } from '../repositories/sqlite-subscription.repository';
import { SQLitePricingRuleRepository } from '../repositories/sqlite-pricing-rule.repository';
import type { CustomerEntity, InvoiceEntity, PaymentEntity, SubscriptionEntity, PricingRuleEntity } from '../../domain/entities';

export type SyncStatus = 'idle' | 'syncing' | 'complete' | 'error';

export interface SyncProgress {
  status: SyncStatus;
  current: number;
  total: number;
  lastSyncAt: string | null;
  errorMessage: string | null;
  pendingCount: number;
}

/**
 * SyncService — orchestrates the manual sync process.
 * This is the ONLY place that triggers HTTP calls (via ApiClient).
 * No automatic sync. Only triggered by user pressing "Sync Now".
 */
export class SyncService {
  private syncQueueRepo = new SQLiteSyncQueueRepository();
  private customerRepo = new SQLiteCustomerRepository();
  private invoiceRepo = new SQLiteInvoiceRepository();
  private paymentRepo = new SQLitePaymentRepository();
  private subscriptionRepo = new SQLiteSubscriptionRepository();
  private pricingRuleRepo = new SQLitePricingRuleRepository();

  private onProgressUpdate: ((progress: SyncProgress) => void) | null = null;

  /** Register a progress callback */
  setProgressCallback(callback: (progress: SyncProgress) => void) {
    this.onProgressUpdate = callback;
  }

  /** Get the number of pending sync items */
  async getPendingCount(): Promise<number> {
    return this.syncQueueRepo.getPendingCount();
  }

  /**
   * Execute the full sync process:
   * 1. Push local changes to server
   * 2. Pull server data to local
   */
  async sync(): Promise<SyncProgress> {
    const progress: SyncProgress = {
      status: 'syncing',
      current: 0,
      total: 0,
      lastSyncAt: null,
      errorMessage: null,
      pendingCount: 0,
    };

    try {
      this.emitProgress({ ...progress, status: 'syncing' });

      // Step 1: Push local changes
      const pendingItems = await this.syncQueueRepo.getPending();
      progress.total = pendingItems.length;

      if (pendingItems.length > 0) {
        // Mark as syncing
        const ids = pendingItems.map((item) => item.id);
        await this.syncQueueRepo.markAsSyncing(ids);

        // Build batch payload
        const operations = pendingItems.map((item) => ({
          entityType: item.entityType,
          entityId: item.entityId,
          operation: item.operation,
          payload: JSON.parse(item.payload) as Record<string, unknown>,
          updatedAt: (JSON.parse(item.payload) as Record<string, unknown>)['updatedAt'] as string ?? item.createdAt,
        }));

        // Send to server
        const response = await apiClient.syncBatch(operations);

        // Process results
        for (let i = 0; i < response.results.length; i++) {
          const result = response.results[i];
          const queueItem = pendingItems[i];

          if (!result || !queueItem) continue;

          switch (result.status) {
            case 'SUCCESS':
              await this.syncQueueRepo.markAsSuccess([queueItem.id]);
              break;

            case 'CONFLICT':
              // Accept server version
              await this.syncQueueRepo.markAsSuccess([queueItem.id]);
              if (result.serverVersion) {
                await this.upsertServerVersion(
                  queueItem.entityType,
                  result.serverVersion
                );
              }
              break;

            case 'ERROR':
              await this.syncQueueRepo.markAsFailed(
                queueItem.id,
                result.error ?? 'Unknown server error'
              );
              break;
          }

          progress.current = i + 1;
          this.emitProgress({ ...progress });
        }
      }

      // Step 2: Pull server data
      await this.pullServerData();

      // Done
      const now = new Date().toISOString();
      const pendingCount = await this.syncQueueRepo.getPendingCount();
      const finalProgress: SyncProgress = {
        status: pendingCount > 0 ? 'error' : 'complete',
        current: progress.total,
        total: progress.total,
        lastSyncAt: now,
        errorMessage: pendingCount > 0 ? `${pendingCount} items failed to sync` : null,
        pendingCount,
      };

      this.emitProgress(finalProgress);
      return finalProgress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      const pendingCount = await this.syncQueueRepo.getPendingCount();
      const errorProgress: SyncProgress = {
        status: 'error',
        current: progress.current,
        total: progress.total,
        lastSyncAt: null,
        errorMessage,
        pendingCount,
      };

      this.emitProgress(errorProgress);
      return errorProgress;
    }
  }

  /** Pull all data from server and upsert into local SQLite */
  private async pullServerData(): Promise<void> {
    try {
      // Pull customers
      const customers = await apiClient.fetchEntities('customers');
      for (const c of customers) {
        await this.customerRepo.upsertFromServer(c as unknown as CustomerEntity);
      }

      // Pull invoices
      const invoices = await apiClient.fetchEntities('invoices');
      for (const inv of invoices) {
        await this.invoiceRepo.upsertFromServer(inv as unknown as InvoiceEntity);
      }

      // Pull payments
      const payments = await apiClient.fetchEntities('payments');
      for (const p of payments) {
        await this.paymentRepo.upsertFromServer(p as unknown as PaymentEntity);
      }

      // Pull subscriptions
      const subs = await apiClient.fetchEntities('subscriptions');
      for (const s of subs) {
        await this.subscriptionRepo.upsertFromServer(s as unknown as SubscriptionEntity);
      }

      // Pull pricing rules
      const rules = await apiClient.fetchEntities('pricing-rules');
      for (const r of rules) {
        await this.pricingRuleRepo.upsertFromServer(r as unknown as PricingRuleEntity);
      }
    } catch (error) {
      // Pull failures are non-critical — local data still works
      console.error('Pull from server failed:', error);
    }
  }

  /** Upsert a server version of an entity into local SQLite */
  private async upsertServerVersion(
    entityType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    switch (entityType) {
      case 'customer':
        await this.customerRepo.upsertFromServer(data as unknown as CustomerEntity);
        break;
      case 'invoice':
        await this.invoiceRepo.upsertFromServer(data as unknown as InvoiceEntity);
        break;
      case 'payment':
        await this.paymentRepo.upsertFromServer(data as unknown as PaymentEntity);
        break;
      case 'subscription':
        await this.subscriptionRepo.upsertFromServer(data as unknown as SubscriptionEntity);
        break;
    }
  }

  private emitProgress(progress: SyncProgress) {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }
  }
}

/** Singleton sync service instance */
export const syncService = new SyncService();
