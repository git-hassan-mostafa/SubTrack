import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SQLiteInvoiceRepository } from '../../src/data/repositories/sqlite-invoice.repository';
import { SQLitePaymentRepository } from '../../src/data/repositories/sqlite-payment.repository';
import type { InvoiceEntity, PaymentEntity } from '../../src/domain/entities';

const invoiceRepo = new SQLiteInvoiceRepository();
const paymentRepo = new SQLitePaymentRepository();

/**
 * Dashboard screen — business overview with key metrics.
 * All data comes from local SQLite.
 */
export default function DashboardScreen() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [expectedRevenue, setExpectedRevenue] = useState(0);
  const [collectionRate, setCollectionRate] = useState(0);
  const [recentPayments, setRecentPayments] = useState<PaymentEntity[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<InvoiceEntity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const allInvoices = await invoiceRepo.findAll();
      const allPayments = await paymentRepo.findAll();

      // Total revenue (sum of all payments this month)
      const now = new Date();
      const thisMonth = allPayments.filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const revenue = thisMonth.reduce((sum, p) => sum + p.amount, 0);

      // Pending payments (unpaid + overdue invoices)
      const pending = allInvoices
        .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Expected revenue (all non-cancelled invoices)
      const expected = allInvoices
        .filter((inv) => inv.status !== 'CANCELLED')
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Collection rate
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const rate = expected > 0 ? (totalPaid / expected) * 100 : 0;

      // Overdue invoices
      const overdue = allInvoices.filter(
        (inv) =>
          (inv.status === 'OVERDUE' || inv.status === 'PENDING') &&
          new Date(inv.dueDate) < now
      );

      setTotalRevenue(revenue);
      setPendingAmount(pending);
      setExpectedRevenue(expected);
      setCollectionRate(Math.min(rate, 100));
      setRecentPayments(allPayments.slice(0, 5));
      setOverdueInvoices(overdue.slice(0, 5));
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void onRefresh(); }} tintColor="#6366F1" />}
    >
      <Text style={styles.greeting}>📊 Business Overview</Text>

      {/* Metric Cards */}
      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.cardRevenue]}>
          <Text style={styles.cardLabel}>Monthly Revenue</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalRevenue)}</Text>
        </View>
        <View style={[styles.card, styles.cardPending]}>
          <Text style={styles.cardLabel}>Pending Payments</Text>
          <Text style={styles.cardValue}>{formatCurrency(pendingAmount)}</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.cardExpected]}>
          <Text style={styles.cardLabel}>Expected Revenue</Text>
          <Text style={styles.cardValue}>{formatCurrency(expectedRevenue)}</Text>
        </View>
        <View style={[styles.card, styles.cardRate]}>
          <Text style={styles.cardLabel}>Collection Rate</Text>
          <Text style={styles.cardValue}>{collectionRate.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Recent Payments */}
      <Text style={styles.sectionTitle}>💵 Recent Payments</Text>
      {recentPayments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No payments recorded yet</Text>
        </View>
      ) : (
        recentPayments.map((payment) => (
          <View key={payment.id} style={styles.listItem}>
            <View>
              <Text style={styles.listItemTitle}>Invoice Payment</Text>
              <Text style={styles.listItemSubtitle}>
                {payment.method} · {new Date(payment.paymentDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.listItemAmount}>{formatCurrency(payment.amount)}</Text>
          </View>
        ))
      )}

      {/* Overdue Invoices */}
      <Text style={styles.sectionTitle}>🔴 Overdue Invoices</Text>
      {overdueInvoices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No overdue invoices — great!</Text>
        </View>
      ) : (
        overdueInvoices.map((inv) => (
          <View key={inv.id} style={styles.listItem}>
            <View>
              <Text style={styles.listItemTitle}>{inv.invoiceNumber}</Text>
              <Text style={styles.listItemSubtitle}>
                Due: {new Date(inv.dueDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.listItemAmount, { color: '#EF4444' }]}>
              {formatCurrency(inv.amount)}
            </Text>
          </View>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
  },
  cardRevenue: { backgroundColor: '#065F46' },
  cardPending: { backgroundColor: '#92400E' },
  cardExpected: { backgroundColor: '#1E3A5F' },
  cardRate: { backgroundColor: '#581C87' },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 24,
    marginBottom: 12,
  },
  listItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  listItemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34D399',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
