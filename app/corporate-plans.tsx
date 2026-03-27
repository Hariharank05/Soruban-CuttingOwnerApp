import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, Modal, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

interface CorporateClient {
  id: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  plans: CorporatePlan[];
  status: 'active' | 'pending' | 'trial' | 'expired';
  joinDate: string;
  employeeCount: number;
  totalMonthlyValue: number;
}

interface CorporatePlan {
  id: string;
  name: string;
  type: 'fruit_basket' | 'snack_pack' | 'wellness_basic' | 'wellness_pro' | 'pantry' | 'event';
  frequency: 'daily' | 'weekly' | 'monthly' | 'one_time';
  cost: number;
  employeesServed: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextDelivery?: string;
}

const DEMO_CLIENTS: CorporateClient[] = [
  {
    id: 'CC1', companyName: 'TechCorp Solutions', contactPerson: 'Suresh Menon', contactPhone: '9876500010', email: 'suresh@techcorp.com',
    address: 'Tidel Park, ELCOT SEZ, Coimbatore', status: 'active', joinDate: '2026-01-15', employeeCount: 85, totalMonthlyValue: 42500,
    plans: [
      { id: 'CP1', name: 'Office Fruit Basket', type: 'fruit_basket', frequency: 'daily', cost: 350, employeesServed: 85, status: 'active', startDate: '2026-01-15', nextDelivery: '2026-03-19' },
      { id: 'CP2', name: 'Employee Wellness Pro', type: 'wellness_pro', frequency: 'daily', cost: 120, employeesServed: 25, status: 'active', startDate: '2026-02-01', nextDelivery: '2026-03-19' },
    ],
  },
  {
    id: 'CC2', companyName: 'GreenLeaf Startup', contactPerson: 'Anita Krishnan', contactPhone: '9876500011', email: 'anita@greenleaf.io',
    address: 'Peelamedu, Coimbatore', status: 'active', joinDate: '2026-02-20', employeeCount: 22, totalMonthlyValue: 15400,
    plans: [
      { id: 'CP3', name: 'Meeting Snack Pack', type: 'snack_pack', frequency: 'daily', cost: 500, employeesServed: 22, status: 'active', startDate: '2026-02-20', nextDelivery: '2026-03-19' },
      { id: 'CP4', name: 'Employee Wellness Basic', type: 'wellness_basic', frequency: 'daily', cost: 45, employeesServed: 22, status: 'active', startDate: '2026-02-20', nextDelivery: '2026-03-19' },
    ],
  },
  {
    id: 'CC3', companyName: 'FinServe India', contactPerson: 'Rajesh Nair', contactPhone: '9876500012', email: 'rajesh@finserve.in',
    address: 'Race Course Road, Coimbatore', status: 'trial', joinDate: '2026-03-10', employeeCount: 45, totalMonthlyValue: 10500,
    plans: [
      { id: 'CP5', name: 'Office Fruit Basket', type: 'fruit_basket', frequency: 'daily', cost: 350, employeesServed: 45, status: 'active', startDate: '2026-03-10', nextDelivery: '2026-03-19' },
    ],
  },
  {
    id: 'CC4', companyName: 'HealthFirst Hospital', contactPerson: 'Dr. Ramya', contactPhone: '9876500013', email: 'ramya@healthfirst.com',
    address: 'Gandhipuram, Coimbatore', status: 'pending', joinDate: '2026-03-16', employeeCount: 120, totalMonthlyValue: 0,
    plans: [],
  },
  {
    id: 'CC5', companyName: 'EduSpark Academy', contactPerson: 'Mohan Das', contactPhone: '9876500014', email: 'mohan@eduspark.edu',
    address: 'Singanallur, Coimbatore', status: 'expired', joinDate: '2025-12-01', employeeCount: 35, totalMonthlyValue: 0,
    plans: [
      { id: 'CP6', name: 'Office Pantry Stock', type: 'pantry', frequency: 'weekly', cost: 250, employeesServed: 35, status: 'cancelled', startDate: '2025-12-01' },
    ],
  },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  active: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle' },
  pending: { color: '#1565C0', bg: '#E3F2FD', icon: 'clock-outline' },
  trial: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'test-tube' },
  expired: { color: '#C62828', bg: '#FFEBEE', icon: 'clock-alert' },
  paused: { color: '#E65100', bg: '#FFF3E0', icon: 'pause-circle' },
  cancelled: { color: '#616161', bg: '#F5F5F5', icon: 'close-circle' },
};

const PLAN_TYPE_ICONS: Record<string, string> = {
  fruit_basket: 'fruit-grapes',
  snack_pack: 'food-croissant',
  wellness_basic: 'heart-pulse',
  wellness_pro: 'shield-star',
  pantry: 'fridge',
  event: 'party-popper',
};

export default function CorporatePlansScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [clients] = useState(DEMO_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<CorporateClient | null>(null);

  const stats = useMemo(() => {
    const active = clients.filter(c => c.status === 'active');
    return {
      totalClients: clients.length,
      activeClients: active.length,
      totalEmployees: active.reduce((s, c) => s + c.employeeCount, 0),
      monthlyRevenue: active.reduce((s, c) => s + c.totalMonthlyValue, 0),
      activePlans: active.reduce((s, c) => s + c.plans.filter(p => p.status === 'active').length, 0),
      pendingClients: clients.filter(c => c.status === 'pending').length,
    };
  }, [clients]);

  const renderClient = ({ item }: { item: CorporateClient }) => {
    const sc = STATUS_CONFIG[item.status];
    const activePlans = item.plans.filter(p => p.status === 'active');
    return (
      <TouchableOpacity
        style={[styles.clientCard, themed.card]}
        activeOpacity={0.7}
        onPress={() => setSelectedClient(item)}
      >
        <View style={styles.clientHeader}>
          <View style={[styles.companyIcon, { backgroundColor: sc.bg }]}>
            <Icon name="domain" size={24} color={sc.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardRow}>
              <Text style={[styles.companyName, themed.textPrimary]}>{item.companyName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Icon name={sc.icon as any} size={10} color={sc.color} />
                <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.contactInfo}>{item.contactPerson} · {item.contactPhone}</Text>
          </View>
        </View>

        <View style={styles.clientStats}>
          <View style={styles.clientStat}>
            <Icon name="account-multiple" size={14} color={COLORS.text.muted} />
            <Text style={styles.clientStatText}>{item.employeeCount} employees</Text>
          </View>
          <View style={styles.clientStat}>
            <Icon name="package-variant" size={14} color={COLORS.text.muted} />
            <Text style={styles.clientStatText}>{activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}</Text>
          </View>
          {item.totalMonthlyValue > 0 && (
            <View style={styles.clientStat}>
              <Icon name="currency-inr" size={14} color={COLORS.primary} />
              <Text style={[styles.clientStatText, { color: COLORS.primary, fontWeight: '700' }]}>{(item.totalMonthlyValue / 1000).toFixed(1)}K/mo</Text>
            </View>
          )}
        </View>

        {activePlans.length > 0 && (
          <View style={styles.plansPreview}>
            {activePlans.map(plan => (
              <View key={plan.id} style={styles.planChip}>
                <Icon name={(PLAN_TYPE_ICONS[plan.type] || 'package') as any} size={12} color={COLORS.primary} />
                <Text style={styles.planChipText}>{plan.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.clientAddress}>
          <Icon name="map-marker" size={14} color={COLORS.text.muted} />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={['#1A237E', '#283593']} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Corporate Plans</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => Alert.alert('Add Client', 'New corporate client registration coming soon!')}>
              <Icon name="plus" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statChip}>
            <Icon name="domain" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="check-circle" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.activeClients}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="account-multiple" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="package-variant" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.activePlans}</Text>
            <Text style={styles.statLabel}>Plans</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="currency-inr" size={16} color="#FFF" />
            <Text style={styles.statValue}>{(stats.monthlyRevenue / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Monthly Rev</Text>
          </View>
          {stats.pendingClients > 0 && (
            <View style={[styles.statChip, { backgroundColor: 'rgba(255,183,77,0.3)' }]}>
              <Icon name="clock-alert" size={16} color="#FFB74D" />
              <Text style={styles.statValue}>{stats.pendingClients}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Client List */}
      <FlatList
        data={clients}
        keyExtractor={c => c.id}
        renderItem={renderClient}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Client Detail Modal */}
      <Modal visible={!!selectedClient} animationType="slide" presentationStyle="pageSheet">
        {selectedClient && (
          <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
            <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
              <TouchableOpacity onPress={() => setSelectedClient(null)}>
                <Icon name="close" size={24} color={themed.colors.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, themed.textPrimary]}>{selectedClient.companyName}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Contact', `Call ${selectedClient.contactPerson}?`)}>
                <Icon name="phone" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.listContent}>
              {/* Company Info */}
              <View style={[styles.infoCard, themed.card]}>
                <Text style={[styles.infoTitle, themed.textPrimary]}>Company Details</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Contact</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.contactPerson}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.contactPhone}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.email}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.address}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Employees</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.employeeCount}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Since</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedClient.joinDate}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Monthly Value</Text><Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>{'\u20B9'}{selectedClient.totalMonthlyValue.toLocaleString()}</Text></View>
              </View>

              {/* Plans */}
              <Text style={[styles.sectionTitle, themed.textPrimary]}>Subscribed Plans ({selectedClient.plans.length})</Text>
              {selectedClient.plans.length === 0 ? (
                <View style={[styles.emptyCard, themed.card]}>
                  <Icon name="package-variant-closed" size={36} color={COLORS.text.muted} />
                  <Text style={styles.emptyText}>No plans subscribed yet</Text>
                  <TouchableOpacity style={styles.addPlanBtn}>
                    <Text style={styles.addPlanText}>Suggest a Plan</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                selectedClient.plans.map(plan => {
                  const ps = STATUS_CONFIG[plan.status];
                  return (
                    <View key={plan.id} style={[styles.planCard, themed.card]}>
                      <View style={[styles.planIcon, { backgroundColor: ps.bg }]}>
                        <Icon name={(PLAN_TYPE_ICONS[plan.type] || 'package') as any} size={22} color={ps.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.cardRow}>
                          <Text style={[styles.planName, themed.textPrimary]}>{plan.name}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: ps.bg }]}>
                            <Text style={[styles.statusText, { color: ps.color }]}>{plan.status}</Text>
                          </View>
                        </View>
                        <View style={styles.planMeta}>
                          <Text style={styles.planMetaText}>{plan.frequency}</Text>
                          <Text style={styles.metaDot}>·</Text>
                          <Text style={styles.planMetaText}>{plan.employeesServed} served</Text>
                          <Text style={styles.metaDot}>·</Text>
                          <Text style={[styles.planMetaText, { color: COLORS.primary, fontWeight: '700' }]}>{'\u20B9'}{plan.cost}/{plan.frequency === 'daily' ? 'day' : plan.frequency === 'weekly' ? 'week' : 'month'}</Text>
                        </View>
                        {plan.nextDelivery && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Icon name="truck-delivery" size={12} color={COLORS.text.muted} />
                            <Text style={styles.planMetaText}>Next: {plan.nextDelivery}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Invoice', 'Generate monthly invoice?')}>
                  <Icon name="file-document" size={18} color="#1565C0" />
                  <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Renew', 'Send renewal reminder?')}>
                  <Icon name="refresh" size={18} color="#388E3C" />
                  <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Renew</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFF3E0' }]} onPress={() => Alert.alert('Pause', 'Pause all plans for this client?')}>
                  <Icon name="pause-circle" size={18} color="#E65100" />
                  <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Pause</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statsScroll: { marginTop: SPACING.md },
  statsContainer: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', minWidth: 80 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 2 },
  statLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  listContent: { padding: SPACING.base, paddingBottom: 40 },
  clientCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  clientHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  companyIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  contactInfo: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  clientStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, flexWrap: 'wrap', gap: 4 },
  clientStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clientStatText: { fontSize: 11, color: COLORS.text.secondary },
  plansPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SPACING.sm },
  planChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
  planChipText: { fontSize: 10, fontWeight: '600', color: COLORS.primary },
  clientAddress: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  addressText: { fontSize: 11, color: COLORS.text.muted, flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  infoCard: { borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  infoTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 12, color: COLORS.text.muted },
  infoValue: { fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  planIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  planName: { fontSize: 13, fontWeight: '700' },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  planMetaText: { fontSize: 11, color: COLORS.text.muted, textTransform: 'capitalize' },
  metaDot: { fontSize: 11, color: COLORS.text.muted },
  emptyCard: { borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOW.sm },
  emptyText: { fontSize: 13, color: COLORS.text.muted, marginTop: SPACING.sm },
  addPlanBtn: { backgroundColor: '#E3F2FD', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginTop: SPACING.md },
  addPlanText: { fontSize: 12, fontWeight: '700', color: '#1565C0' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACING.md },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});
