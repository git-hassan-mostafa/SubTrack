import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useInvoiceStore } from '../../src/state/invoice.store';
import { Ionicons } from '@expo/vector-icons';
import type { InvoiceEntity } from '../../src/domain/entities';

const STATUS_COLORS: Record<string, string> = {
  PAID: '#34D399',
  PENDING: '#FBBF24',
  OVERDUE: '#EF4444',
  CANCELLED: '#6B7280',
};

const STATUS_BG: Record<string, string> = {
  PAID: '#065F4620',
  PENDING: '#92400E20',
  OVERDUE: '#7F1D1D20',
  CANCELLED: '#37415120',
};

export default function InvoicesScreen() {
  const { invoices, selectedInvoice, isLoading, statusFilter, loadInvoices, selectInvoice, setStatusFilter } = useInvoiceStore();

  useEffect(() => {
    void loadInvoices();
  }, []);

  const handleFilter = (filter: string | undefined) => {
    setStatusFilter(filter);
    void loadInvoices(filter);
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const renderInvoice = ({ item }: { item: InvoiceEntity }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => { void selectInvoice(item.id); }}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] ?? STATUS_BG['CANCELLED'] }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? STATUS_COLORS['CANCELLED'] }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceDetails}>
        <Text style={styles.invoiceAmount}>{formatCurrency(item.amount)}</Text>
        <Text style={styles.invoiceDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {[undefined, 'PENDING', 'OVERDUE', 'PAID', 'CANCELLED'].map((f) => (
          <TouchableOpacity
            key={f ?? 'all'}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
              {f ?? 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No invoices</Text>
          </View>
        }
      />

      {/* Invoice Detail Modal */}
      <Modal visible={selectedInvoice !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { useInvoiceStore.setState({ selectedInvoice: null }); }}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invoice Detail</Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedInvoice && (
            <View style={styles.detailContent}>
              <Text style={styles.detailInvoiceNumber}>{selectedInvoice.invoiceNumber}</Text>
              <View style={[styles.statusBadgeLarge, { backgroundColor: STATUS_BG[selectedInvoice.status] ?? STATUS_BG['CANCELLED'] }]}>
                <Text style={[styles.statusTextLarge, { color: STATUS_COLORS[selectedInvoice.status] ?? STATUS_COLORS['CANCELLED'] }]}>
                  {selectedInvoice.status}
                </Text>
              </View>
              <Text style={styles.detailAmount}>{formatCurrency(selectedInvoice.amount)}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issued</Text>
                <Text style={styles.detailValue}>{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</Text>
              </View>
              {selectedInvoice.paidDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid Date</Text>
                  <Text style={styles.detailValue}>{new Date(selectedInvoice.paidDate).toLocaleDateString()}</Text>
                </View>
              )}
              {selectedInvoice.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.notes}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterChipText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#FFF' },
  invoiceCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 8,
  },
  invoiceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  invoiceNumber: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  invoiceDetails: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  invoiceAmount: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  invoiceDate: { color: '#94A3B8', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  cancelText: { color: '#94A3B8', fontSize: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  detailContent: { alignItems: 'center', paddingTop: 32 },
  detailInvoiceNumber: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  statusBadgeLarge: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20 },
  statusTextLarge: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  detailAmount: { color: '#F8FAFC', fontSize: 36, fontWeight: '800', marginBottom: 32 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B',
  },
  detailLabel: { color: '#64748B', fontSize: 14 },
  detailValue: { color: '#CBD5E1', fontSize: 14, fontWeight: '500' },
});
