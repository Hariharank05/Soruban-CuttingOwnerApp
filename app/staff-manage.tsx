// app/staff-manage.tsx - Staff Management Screen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { loadStaff, saveStaff } from '@/src/utils/localJsonStorage';
import type { Staff, StaffRole, StaffPermission } from '@/types';

const ROLE_CONFIG: Record<StaffRole, { label: string; bg: string; color: string }> = {
  order_manager: { label: 'Order Manager', bg: '#E3F2FD', color: '#1565C0' },
  delivery_person: { label: 'Delivery Person', bg: '#E0F2F1', color: '#00796B' },
  billing_staff: { label: 'Billing Staff', bg: '#F3E5F5', color: '#7B1FA2' },
  viewer: { label: 'Viewer', bg: '#FFF3E0', color: '#E65100' },
};

const ROLE_OPTIONS: { key: StaffRole; label: string }[] = [
  { key: 'order_manager', label: 'Order Manager' },
  { key: 'delivery_person', label: 'Delivery' },
  { key: 'billing_staff', label: 'Billing' },
  { key: 'viewer', label: 'Viewer' },
];

const ALL_PERMISSIONS: { key: StaffPermission; label: string }[] = [
  { key: 'view_orders', label: 'View Orders' },
  { key: 'manage_orders', label: 'Manage Orders' },
  { key: 'fill_prices', label: 'Fill Prices' },
  { key: 'manage_catalog', label: 'Manage Catalog' },
  { key: 'view_billing', label: 'View Billing' },
  { key: 'manage_billing', label: 'Manage Billing' },
  { key: 'delivery_updates', label: 'Delivery Updates' },
  { key: 'view_reports', label: 'View Reports' },
];

const DEFAULT_PERMISSIONS: Record<StaffRole, StaffPermission[]> = {
  order_manager: ['view_orders', 'manage_orders', 'fill_prices', 'manage_catalog', 'view_reports'],
  delivery_person: ['view_orders', 'delivery_updates'],
  billing_staff: ['view_orders', 'fill_prices', 'view_billing', 'manage_billing', 'view_reports'],
  viewer: ['view_orders', 'view_billing', 'view_reports'],
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StaffCard({
  staff,
  onToggleActive,
}: {
  staff: Staff;
  onToggleActive: () => void;
}) {
  const roleConfig = ROLE_CONFIG[staff.role] || ROLE_CONFIG.order_manager;

  return (
    <View style={styles.card}>
      {/* Top row: Avatar + Info */}
      <View style={styles.cardTopRow}>
        <View style={[styles.avatarCircle, { backgroundColor: roleConfig.bg }]}>
          <Text style={[styles.avatarText, { color: roleConfig.color }]}>
            {staff.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.staffName}>{staff.name}</Text>
          <View style={styles.phoneRow}>
            <Icon name="phone-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.phoneText}>{staff.phone}</Text>
          </View>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg }]}>
          <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>
            {roleConfig.label}
          </Text>
        </View>
      </View>

      {/* Permission tags */}
      {staff.permissions && staff.permissions.length > 0 && (
        <View style={styles.permissionTagsRow}>
          {staff.permissions.slice(0, 4).map((perm) => {
            const permLabel = ALL_PERMISSIONS.find(p => p.key === perm)?.label || perm;
            return (
              <View key={perm} style={styles.permissionTag}>
                <Text style={styles.permissionTagText}>{permLabel}</Text>
              </View>
            );
          })}
          {staff.permissions.length > 4 && (
            <View style={styles.permissionTag}>
              <Text style={styles.permissionTagText}>+{staff.permissions.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom row: Active toggle + Joined date */}
      <View style={styles.cardBottomRow}>
        <TouchableOpacity
          style={[styles.activePill, staff.isActive ? styles.activePillOn : styles.activePillOff]}
          onPress={onToggleActive}
          activeOpacity={0.7}
        >
          <View style={[styles.activeDot, { backgroundColor: staff.isActive ? '#2E7D32' : '#999' }]} />
          <Text style={[styles.activeText, { color: staff.isActive ? '#2E7D32' : '#999' }]}>
            {staff.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
        <View style={styles.joinedRow}>
          <Icon name="calendar-outline" size={13} color={COLORS.text.muted} />
          <Text style={styles.joinedText}>Joined {formatDate(staff.joinedAt)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function StaffManageScreen() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add staff form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('order_manager');
  const [newPermissions, setNewPermissions] = useState<StaffPermission[]>(DEFAULT_PERMISSIONS['order_manager']);

  const activeCount = useMemo(() => staffList.filter(s => s.isActive).length, [staffList]);

  const handleRoleChange = (role: StaffRole) => {
    setNewRole(role);
    setNewPermissions(DEFAULT_PERMISSIONS[role]);
  };

  const togglePermission = (perm: StaffPermission) => {
    setNewPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  useEffect(() => {
    loadStaff().then(setStaffList);
  }, []);

  const handleToggleActive = async (staffId: string) => {
    const updated = staffList.map(s =>
      s.id === staffId ? { ...s, isActive: !s.isActive } : s
    );
    setStaffList(updated);
    await saveStaff(updated);
  };

  const handleAddStaff = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Staff name is required.');
      return;
    }
    if (!newPhone.trim() || newPhone.trim().length < 10) {
      Alert.alert('Validation', 'Please enter a valid phone number.');
      return;
    }

    const newStaff: Staff = {
      id: `staff_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      role: newRole,
      permissions: newPermissions,
      isActive: true,
      joinedAt: new Date().toISOString(),
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    await saveStaff(updated);

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewRole('order_manager');
    setNewPermissions(DEFAULT_PERMISSIONS['order_manager']);
    setShowAddModal(false);
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="badge-account-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No staff added</Text>
      <Text style={styles.emptySub}>
        Add staff members to manage orders, deliveries, and billing
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ===== HEADER ===== */}
      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>Add Staff</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ===== STAFF COUNT BAR ===== */}
      {staffList.length > 0 && (
        <View style={styles.countBar}>
          <Icon name="account-group" size={18} color={COLORS.text.secondary} />
          <Text style={styles.countBarText}>
            {staffList.length} Staff Members ({activeCount} Active)
          </Text>
        </View>
      )}

      {/* ===== STAFF LIST ===== */}
      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <StaffCard
            staff={item}
            onToggleActive={() => handleToggleActive(item.id)}
          />
        )}
      />

      {/* ===== ADD STAFF MODAL ===== */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add New Staff</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Name Input */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter staff name"
                placeholderTextColor={COLORS.text.muted}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.text.muted}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Role Selector */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Role *</Text>
              <View style={styles.roleRow}>
                {ROLE_OPTIONS.map((option) => {
                  const isActive = newRole === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.rolePill,
                        isActive ? styles.rolePillActive : styles.rolePillInactive,
                      ]}
                      onPress={() => handleRoleChange(option.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.rolePillText,
                        isActive ? styles.rolePillTextActive : styles.rolePillTextInactive,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Permissions */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Permissions</Text>
              <View style={styles.permissionsGrid}>
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = newPermissions.includes(perm.key);
                  return (
                    <TouchableOpacity
                      key={perm.key}
                      style={styles.permCheckRow}
                      onPress={() => togglePermission(perm.key)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={20}
                        color={isChecked ? COLORS.primary : COLORS.text.muted}
                      />
                      <Text style={[styles.permCheckLabel, isChecked && { color: COLORS.text.primary }]}>
                        {perm.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleAddStaff}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Staff</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ height: SPACING.lg }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // --- Header ---
  header: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },

  // --- List ---
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxxl,
  },

  // --- Card ---
  card: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // --- Bottom Row ---
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  activePillOn: {
    backgroundColor: '#E8F5E9',
  },
  activePillOff: {
    backgroundColor: '#F5F5F5',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedText: {
    fontSize: 11,
    color: COLORS.text.muted,
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },

  // --- Form Fields ---
  fieldWrap: {
    marginBottom: SPACING.base,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  rolePill: {
    width: '47%',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  rolePillActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rolePillInactive: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rolePillTextActive: {
    color: '#FFF',
  },
  rolePillTextInactive: {
    color: COLORS.text.secondary,
  },

  // --- Buttons ---
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.md,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  cancelBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },

  // --- Count Bar ---
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  countBarText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  // --- Permission Tags ---
  permissionTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  permissionTag: {
    backgroundColor: COLORS.backgroundSoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  permissionTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // --- Permissions Grid ---
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  permCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '47%' as any,
    paddingVertical: SPACING.xs,
  },
  permCheckLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.muted,
  },

  // --- Empty State ---
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
    marginTop: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});
