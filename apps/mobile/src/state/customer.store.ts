import { create } from 'zustand';
import { SQLiteCustomerRepository } from '../data/repositories/sqlite-customer.repository';
import type { CustomerEntity } from '../domain/entities';

const customerRepo = new SQLiteCustomerRepository();

interface CustomerState {
  customers: CustomerEntity[];
  selectedCustomer: CustomerEntity | null;
  isLoading: boolean;
  error: string | null;

  loadCustomers: () => Promise<void>;
  selectCustomer: (id: string) => Promise<void>;
  createCustomer: (data: Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<CustomerEntity>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,

  loadCustomers: async () => {
    try {
      set({ isLoading: true });
      const customers = await customerRepo.findAll();
      set({ customers, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load customers', isLoading: false });
    }
  },

  selectCustomer: async (id: string) => {
    const customer = await customerRepo.findById(id);
    set({ selectedCustomer: customer });
  },

  createCustomer: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await customerRepo.create(data);
      const customers = await customerRepo.findAll();
      set({ customers, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create customer', isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      await customerRepo.update(id, data);
      const customers = await customerRepo.findAll();
      const selectedCustomer = get().selectedCustomer?.id === id
        ? await customerRepo.findById(id)
        : get().selectedCustomer;
      set({ customers, selectedCustomer, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update customer', isLoading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await customerRepo.delete(id);
      const customers = await customerRepo.findAll();
      set({ customers, selectedCustomer: null, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete customer', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
