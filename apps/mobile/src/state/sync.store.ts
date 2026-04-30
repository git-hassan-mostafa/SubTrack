import { create } from 'zustand';
import { syncService, type SyncProgress } from '../data/sync/sync-service';

interface SyncState {
  progress: SyncProgress;
  isSyncing: boolean;

  /** Trigger manual sync */
  syncNow: () => Promise<void>;
  /** Refresh pending count */
  refreshPendingCount: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  progress: {
    status: 'idle',
    current: 0,
    total: 0,
    lastSyncAt: null,
    errorMessage: null,
    pendingCount: 0,
  },
  isSyncing: false,

  syncNow: async () => {
    set({ isSyncing: true });

    syncService.setProgressCallback((progress) => {
      set({ progress });
    });

    try {
      const result = await syncService.sync();
      set({ progress: result, isSyncing: false });
    } catch (error) {
      set({
        isSyncing: false,
        progress: {
          status: 'error',
          current: 0,
          total: 0,
          lastSyncAt: null,
          errorMessage: error instanceof Error ? error.message : 'Sync failed',
          pendingCount: 0,
        },
      });
    }
  },

  refreshPendingCount: async () => {
    const count = await syncService.getPendingCount();
    set((state) => ({
      progress: { ...state.progress, pendingCount: count },
    }));
  },
}));
