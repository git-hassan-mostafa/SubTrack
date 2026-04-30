import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useCustomerStore } from '../../src/state/customer.store';
import { useAuthStore } from '../../src/state/auth.store';
import { Ionicons } from '@expo/vector-icons';
import type { CustomerEntity } from '../../src/domain/entities';
import { CustomerStatus } from '../../src/domain';

export default function CustomersScreen() {
  const { customers, isLoading, loadCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerEntity | null>(null);
  const [showDetail, setShowDetail] = useState<CustomerEntity | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formAccuracy, setFormAccuracy] = useState('');

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.status !== 'INACTIVE' &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search))
  );

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormLat('');
    setFormLng('');
    setFormAccuracy('');
    setEditingCustomer(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (customer: CustomerEntity) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormPhone(customer.phone);
    setFormAddress(customer.address);
    setFormLat(customer.latitude?.toString() ?? '');
    setFormLng(customer.longitude?.toString() ?? '');
    setFormAccuracy(customer.locationAccuracy?.toString() ?? '');
    setShowForm(true);
  };

  const handleUseLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setFormLat(location.coords.latitude.toString());
      setFormLng(location.coords.longitude.toString());
      setFormAccuracy(location.coords.accuracy?.toString() ?? '');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      Alert.alert('Error', 'Name, phone, and address are required');
      return;
    }

    try {
      const data = {
        tenantId: user?.tenantId ?? '',
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        latitude: formLat ? parseFloat(formLat) : null,
        longitude: formLng ? parseFloat(formLng) : null,
        locationAccuracy: formAccuracy ? parseFloat(formAccuracy) : null,
        status: CustomerStatus.ACTIVE,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
      } else {
        await createCustomer(data);
      }
      setShowForm(false);
      resetForm();
    } catch {
      Alert.alert('Error', 'Failed to save customer');
    }
  };

  const handleDelete = (customer: CustomerEntity) => {
    Alert.alert('Delete Customer', `Are you sure you want to deactivate ${customer.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { void deleteCustomer(customer.id); },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#34D399';
      case 'BLOCKED': return '#EF4444';
      default: return '#64748B';
    }
  };

  const renderCustomer = ({ item }: { item: CustomerEntity }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => setShowDetail(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      <Text style={styles.customerAddress} numberOfLines={1}>{item.address}</Text>
      {item.latitude && (
        <Text style={styles.locationTag}>📍 GPS Tagged</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No customers yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first customer</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddForm}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCustomer ? 'Edit Customer' : 'New Customer'}
            </Text>
            <TouchableOpacity onPress={() => { void handleSave(); }}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Name *</Text>
            <TextInput style={styles.formInput} value={formName} onChangeText={setFormName} placeholder="Customer name" placeholderTextColor="#64748B" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone *</Text>
            <TextInput style={styles.formInput} value={formPhone} onChangeText={setFormPhone} placeholder="+1234567890" placeholderTextColor="#64748B" keyboardType="phone-pad" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Address *</Text>
            <TextInput style={styles.formInput} value={formAddress} onChangeText={setFormAddress} placeholder="Full address" placeholderTextColor="#64748B" multiline />
          </View>

          <TouchableOpacity style={styles.locationButton} onPress={() => { void handleUseLocation(); }}>
            <Ionicons name="navigate" size={20} color="#6366F1" />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>

          {formLat ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoText}>Lat: {formLat}</Text>
              <Text style={styles.locationInfoText}>Lng: {formLng}</Text>
              <Text style={styles.locationInfoText}>Accuracy: {formAccuracy}m</Text>
            </View>
          ) : null}

          <View style={{ height: 48 }} />
        </ScrollView>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={showDetail !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(null)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customer Detail</Text>
            <TouchableOpacity onPress={() => { if (showDetail) { openEditForm(showDetail); setShowDetail(null); } }}>
              <Text style={styles.saveText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {showDetail && (
            <View style={styles.detailContent}>
              <View style={styles.detailAvatarLarge}>
                <Text style={styles.detailAvatarText}>{showDetail.name.charAt(0)}</Text>
              </View>
              <Text style={styles.detailName}>{showDetail.name}</Text>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(showDetail.status) + '30' }]}>
                <Text style={[styles.statusPillText, { color: getStatusColor(showDetail.status) }]}>{showDetail.status}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color="#94A3B8" />
                <Text style={styles.detailValue}>{showDetail.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#94A3B8" />
                <Text style={styles.detailValue}>{showDetail.address}</Text>
              </View>
              {showDetail.latitude && (
                <View style={styles.detailRow}>
                  <Ionicons name="navigate-outline" size={18} color="#94A3B8" />
                  <Text style={styles.detailValue}>
                    {showDetail.latitude.toFixed(6)}, {showDetail.longitude?.toFixed(6)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => { handleDelete(showDetail); setShowDetail(null); }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Deactivate Customer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 15, paddingVertical: 12 },
  customerCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  cardInfo: { flex: 1, marginLeft: 12 },
  customerName: { color: '#F8FAFC', fontWeight: '600', fontSize: 16 },
  customerPhone: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  customerAddress: { color: '#94A3B8', fontSize: 13 },
  locationTag: { color: '#6366F1', fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
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
  saveText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  formGroup: { marginTop: 20 },
  formLabel: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: {
    backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155',
  },
  locationButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1E293B', padding: 14, borderRadius: 12, marginTop: 20,
    borderWidth: 1, borderColor: '#6366F1', borderStyle: 'dashed',
  },
  locationButtonText: { color: '#6366F1', fontWeight: '600', fontSize: 15 },
  locationInfo: {
    backgroundColor: '#1E293B', borderRadius: 8, padding: 12, marginTop: 8, gap: 4,
  },
  locationInfoText: { color: '#94A3B8', fontSize: 13 },
  detailContent: { alignItems: 'center', paddingTop: 32 },
  detailAvatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  detailAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 28 },
  detailName: { color: '#F8FAFC', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  statusPill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 24 },
  statusPillText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    width: '100%', paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1E293B',
  },
  detailValue: { color: '#CBD5E1', fontSize: 15, flex: 1 },
  deleteButton: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    marginTop: 40, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#EF4444',
  },
  deleteButtonText: { color: '#EF4444', fontWeight: '600' },
});
