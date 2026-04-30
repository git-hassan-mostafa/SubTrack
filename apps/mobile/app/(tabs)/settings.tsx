import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../src/state/auth.store';
import { useSyncStore } from '../../src/state/sync.store';
import { Ionicons } from '@expo/vector-icons';

/**
 * Settings screen — Sync Now button, last sync timestamp, logout.
 */
export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { progress, isSyncing, syncNow, refreshPendingCount } = useSyncStore();

  useEffect(() => {
    void refreshPendingCount();
  }, []);

  const handleSync = async () => {
    await syncNow();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => { void logout(); },
      },
    ]);
  };

  const getSyncButtonLabel = () => {
    switch (progress.status) {
      case 'syncing':
        return `Syncing... ${progress.current} of ${progress.total}`;
      case 'complete':
        return '✅ Sync Complete';
      case 'error':
        return `⚠️ Sync Failed. ${progress.pendingCount} items remaining`;
      default:
        return `Sync Now${progress.pendingCount > 0 ? ` (${progress.pendingCount} pending)` : ''}`;
    }
  };

  const getSyncButtonColor = () => {
    switch (progress.status) {
      case 'complete': return '#065F46';
      case 'error': return '#7F1D1D';
      default: return '#6366F1';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name ?? 'Unknown'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role ?? 'Unknown'}</Text>
          </View>
        </View>
      </View>

      {/* Sync Section */}
      <Text style={styles.sectionTitle}>Sync</Text>
      <View style={styles.syncCard}>
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: getSyncButtonColor() }, isSyncing && styles.syncButtonDisabled]}
          onPress={() => { void handleSync(); }}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="sync" size={20} color="#FFF" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.syncButtonText}>{getSyncButtonLabel()}</Text>
        </TouchableOpacity>

        {progress.lastSyncAt && (
          <Text style={styles.lastSync}>
            Last synced: {new Date(progress.lastSyncAt).toLocaleString()}
          </Text>
        )}

        {progress.errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{progress.errorMessage}</Text>
          </View>
        )}

        <View style={styles.syncStats}>
          <View style={styles.syncStat}>
            <Text style={styles.syncStatValue}>{progress.pendingCount}</Text>
            <Text style={styles.syncStatLabel}>Pending</Text>
          </View>
          <View style={styles.syncStat}>
            <Text style={styles.syncStatValue}>{progress.current}</Text>
            <Text style={styles.syncStatLabel}>Synced</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>SubTrack v1.0.0</Text>
        <Text style={styles.appInfoText}>Generator Management System</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 16 },
  userCard: {
    flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16,
    padding: 20, marginTop: 16, alignItems: 'center',
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  userEmail: { color: '#94A3B8', fontSize: 14, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: '#6366F120', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  roleText: { color: '#818CF8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: {
    color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginTop: 28, marginBottom: 12,
  },
  syncCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20,
  },
  syncButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 16,
  },
  syncButtonDisabled: { opacity: 0.7 },
  syncButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  lastSync: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 12 },
  errorBox: {
    backgroundColor: '#7F1D1D', borderRadius: 8, padding: 12, marginTop: 12,
  },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  syncStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 16,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155',
  },
  syncStat: { alignItems: 'center' },
  syncStatValue: { color: '#F8FAFC', fontSize: 24, fontWeight: '800' },
  syncStatLabel: { color: '#64748B', fontSize: 12, marginTop: 4 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#EF444430',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  appInfo: { alignItems: 'center', paddingVertical: 32 },
  appInfoText: { color: '#475569', fontSize: 12 },
});
