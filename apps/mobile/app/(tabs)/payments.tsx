import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { usePaymentStore } from '../../src/state/payment.store';
import { useAuthStore } from '../../src/state/auth.store';
import { SQLiteInvoiceRepository } from '../../src/data/repositories/sqlite-invoice.repository';
import { Ionicons } from '@expo/vector-icons';
import { InvoiceStatus, PaymentMethod } from '@subtrack/shared';
import type { PaymentEntity, InvoiceEntity } from '../../src/domain/entities';

const invoiceRepo = new SQLiteInvoiceRepository();

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: '💵 Cash',
  [PaymentMethod.BANK_TRANSFER]: '🏦 Bank Transfer',
  [PaymentMethod.MOBILE_MONEY]: '📱 Mobile Money',
  [PaymentMethod.CHEQUE]: '📝 Cheque',
};

export default function PaymentsScreen() {
  const { payments, isLoading, loadPayments, createPayment } = usePaymentStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceEntity | null>(null);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [formRef, setFormRef] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    void loadPayments();
  }, []);

  const openForm = async () => {
    const allInvoices = await invoiceRepo.findAll();
    const unpaid = allInvoices.filter((inv) => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED);
    setInvoices(unpaid);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedInvoice) {
      Alert.alert('Error', 'Please select an invoice');
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero');
      return;
    }

    try {
      await createPayment({
        tenantId: user?.tenantId ?? '',
        invoiceId: selectedInvoice.id,
        amount,
        method: formMethod,
        referenceNumber: formRef || null,
        paymentDate: new Date().toISOString(),
        notes: formNotes || null,
      });
      setShowForm(false);
      setSelectedInvoice(null);
      setFormAmount('');
      setFormRef('');
      setFormNotes('');
    } catch {
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const renderPayment = ({ item }: { item: PaymentEntity }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentMethod}>
          {METHOD_LABELS[item.method] ?? item.method}
        </Text>
        <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      <Text style={styles.paymentDate}>
        {new Date(item.paymentDate).toLocaleDateString()}
      </Text>
      {item.referenceNumber && (
        <Text style={styles.paymentRef}>Ref: {item.referenceNumber}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>No payments recorded</Text>
            <Text style={styles.emptySubtitle}>Tap + to record a payment</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { void openForm(); }}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Payment Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => { void handleSave(); }}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Invoice Selection */}
          <Text style={styles.formLabel}>Select Invoice *</Text>
          {invoices.map((inv) => (
            <TouchableOpacity
              key={inv.id}
              style={[styles.invoiceOption, selectedInvoice?.id === inv.id && styles.invoiceOptionActive]}
              onPress={() => setSelectedInvoice(inv)}
            >
              <Text style={styles.invoiceOptionNumber}>{inv.invoiceNumber}</Text>
              <Text style={styles.invoiceOptionAmount}>{formatCurrency(inv.amount)}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Amount *</Text>
            <TextInput style={styles.formInput} value={formAmount} onChangeText={setFormAmount} placeholder="0.00" placeholderTextColor="#64748B" keyboardType="decimal-pad" />
          </View>

          {/* Payment Method */}
          <Text style={styles.formLabel}>Payment Method</Text>
          <View style={styles.methodGrid}>
            {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.methodChip, formMethod === key && styles.methodChipActive]}
                onPress={() => setFormMethod(key)}
              >
                <Text style={[styles.methodChipText, formMethod === key && styles.methodChipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Reference Number</Text>
            <TextInput style={styles.formInput} value={formRef} onChangeText={setFormRef} placeholder="Optional" placeholderTextColor="#64748B" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput style={styles.formInput} value={formNotes} onChangeText={setFormNotes} placeholder="Optional notes" placeholderTextColor="#64748B" multiline />
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  paymentCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  paymentMethod: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  paymentAmount: { color: '#34D399', fontSize: 18, fontWeight: '800' },
  paymentDate: { color: '#94A3B8', fontSize: 13 },
  paymentRef: { color: '#64748B', fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#34D399', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: '#64748B', fontSize: 14, marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  cancelText: { color: '#94A3B8', fontSize: 16 },
  saveText: { color: '#34D399', fontSize: 16, fontWeight: '600' },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  formGroup: { marginTop: 20 },
  formLabel: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  formInput: {
    backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155',
  },
  invoiceOption: {
    backgroundColor: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 6,
    flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#334155',
  },
  invoiceOptionActive: { borderColor: '#34D399' },
  invoiceOptionNumber: { color: '#F8FAFC', fontWeight: '600' },
  invoiceOptionAmount: { color: '#94A3B8' },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  methodChipActive: { backgroundColor: '#34D39920', borderColor: '#34D399' },
  methodChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  methodChipTextActive: { color: '#34D399' },
});
