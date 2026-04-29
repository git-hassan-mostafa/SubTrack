import { create } from 'zustand';
import { SQLiteSubscriptionRepository } from '../data/repositories/sqlite-subscription.repository';
import type { SubscriptionEntity } from '../domain/entities';

const subRepo = new SQLiteSubscriptionRepository();

interface SubscriptionState {
  subscriptions: SubscriptionEntity[];
  selectedSubscription: SubscriptionEntity | null;
  isLoading: boolean;
  error: string | null;

  loadSubscriptions: () => Promise<void>;
  selectSubscription: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  selectedSubscription: null,
  isLoading: false,
  error: null,

  loadSubscriptions: async () => {
    try {
      set({ isLoading: true });
      const subscriptions = await subRepo.findAll();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load subscriptions', isLoading: false });
    }
  },

  selectSubscription: async (id: string) => {
    const sub = await subRepo.findById(id);
    set({ selectedSubscription: sub });
  },

  clearError: () => set({ error: null }),
}));
