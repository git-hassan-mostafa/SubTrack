import { create } from 'zustand';
import { SQLiteInvoiceRepository } from '../data/repositories/sqlite-invoice.repository';
import type { InvoiceEntity } from '../domain/entities';

const invoiceRepo = new SQLiteInvoiceRepository();

interface InvoiceState {
  invoices: InvoiceEntity[];
  selectedInvoice: InvoiceEntity | null;
  isLoading: boolean;
  error: string | null;
  statusFilter: string | undefined;

  loadInvoices: (statusFilter?: string) => Promise<void>;
  selectInvoice: (id: string) => Promise<void>;
  setStatusFilter: (filter: string | undefined) => void;
  clearError: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  statusFilter: undefined,

  loadInvoices: async (statusFilter?: string) => {
    try {
      set({ isLoading: true });
      const invoices = await invoiceRepo.findAll(statusFilter);
      set({ invoices, isLoading: false, statusFilter });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load invoices', isLoading: false });
    }
  },

  selectInvoice: async (id: string) => {
    const invoice = await invoiceRepo.findById(id);
    set({ selectedInvoice: invoice });
  },

  setStatusFilter: (filter: string | undefined) => set({ statusFilter: filter }),

  clearError: () => set({ error: null }),
}));
