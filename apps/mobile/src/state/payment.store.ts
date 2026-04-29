import { create } from 'zustand';
import { SQLitePaymentRepository } from '../data/repositories/sqlite-payment.repository';
import { SQLiteInvoiceRepository } from '../data/repositories/sqlite-invoice.repository';
import type { PaymentEntity } from '../domain/entities';

const paymentRepo = new SQLitePaymentRepository();
const invoiceRepo = new SQLiteInvoiceRepository();

interface PaymentState {
  payments: PaymentEntity[];
  isLoading: boolean;
  error: string | null;

  loadPayments: (invoiceId?: string) => Promise<void>;
  createPayment: (data: Omit<PaymentEntity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  loadPayments: async (invoiceId?: string) => {
    try {
      set({ isLoading: true });
      const payments = await paymentRepo.findAll(invoiceId);
      set({ payments, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load payments', isLoading: false });
    }
  },

  createPayment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const payment = await paymentRepo.create(data);

      // Update invoice status locally
      const totalPaid = await paymentRepo.sumByInvoice(data.invoiceId);
      const invoice = await invoiceRepo.findById(data.invoiceId);
      if (invoice && totalPaid >= invoice.amount) {
        await invoiceRepo.update(data.invoiceId, {
          status: 'PAID',
          paidDate: new Date().toISOString(),
        });
      }

      const payments = await paymentRepo.findAll();
      set({ payments, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create payment', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
