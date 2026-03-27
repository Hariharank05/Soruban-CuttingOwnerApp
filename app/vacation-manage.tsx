// app/vacation-manage.tsx - Vacation Mode Management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useSubscriptions } from '@/context/SubscriptionContext';
import type { Subscription } from '@/types';

type FilterKey = 'all' | 'active' | 'upcoming' | 'completed';

interface VacationEntry {
  id: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  affectedDeliveries: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  active: { label: 'Active', bg: '#FFF3E0', color: '#E65100', icon: 'beach' },
  upcoming: { label: 'Upcoming', bg: '#E3F2FD', color: '#1565C0', icon: 'calendar-clock' },
  completed: { label: 'Completed', bg: '#E8F5E9', color: '#2E7D32', icon: 'check-circle' },
  cancelled: { label: 'Cancelled', bg: '#F5F5F5', color: '#757575', icon: 'close-circle' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const DEMO_VACATIONS: VacationEntry[] = [
  { id: 'v1', customerId: 'c1', customerName: 'Priya Sharma', subscriptionId: 'sub-001', startDate: '2026-03-15', endDate: '2026-03-28', reason: 'Family trip to Kerala', status: 'active', affectedDeliveries: 12 },
  { id: 'v2', customerId: 'c2', customerName: 'Ravi Kumar', subscriptionId: 'sub-002', startDate: '2026-04-01', endDate: '2026-04-10', reason: 'Business travel', status: 'upcoming', affectedDeliveries: 4 },
  { id: 'v3', customerId: 'c3', customerName: 'Meena Krishnan', subscriptionId: 'sub-003', startDate: '2026-03-01', endDate: '2026-03-10', reason: 'Health recovery', status: 'completed', affectedDeliveries: 8 },
  { id: 'v4', customerId: 'c4', customerName: 'Arun Patel', subscriptionId: 'sub-004', startDate: '2026-04-15', endDate: '2026-04-25', reason: 'Vacation abroad', status: 'upcoming', affectedDeliveries: 5 },
  { id: 'v5', customerId: 'c5', customerName: 'Kavitha Raj', subscriptionId: 'sub-005', startDate: '2026-02-20', endDate: '2026-03-05', reason: 'Moving houses', status: 'completed', affectedDeliveries: 10 },
  { id: 'v6', customerId: 'c6', customerName: 'Lakshmi Sundaram', subscriptionId: 'sub-006', startDate: '2026-03-20', endDate: '2026-04-02', reason: 'Temple pilgrimage', status: 'active', affectedDeliveries: 7 },
  { id: 'v7', customerId: 'c7', customerName: 'Suresh Menon', subscriptionId: 'sub-007', startDate: '2026-03-10', endDate: '2026-03-12', reason: 'Short trip', status: 'cancelled', affectedDeliveries: 2 },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

function getProgress(start: string, end: string): number {
  const now = new Date().getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now < s) return 0;
  if (now > e) return 1;
  return (now - s) / (e - s);
}

export default function VacationManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [vacations, setVacations] = useState<VacationEntry[]>(DEMO_VACATIONS);

  const stats = useMemo(() => {
    const total = vacations.filter(v => v.status !== 'cancelled').length;
    const active = vacations.filter(v => v.status === 'active').length;
    const upcoming = vacations.filter(v => v.status === 'upcoming').length;
    const completed = vacations.filter(v => v.status === 'completed').length;
    return { total, active, upcoming, completed };
  }, [vacations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return vacations;
    return vacations.filter(v => v.status === filter);
  }, [vacations, filter]);

  const handleCancel = (vacation: VacationEntry) => {
    Alert.alert(
      'Cancel Vacation',
      `Cancel ${vacation.customerName}'s vacation from ${formatDate(vacation.startDate)} to ${formatDate(vacation.endDate)}? Their subscription deliveries will resume.`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel Vacation', style: 'destructive', onPress: () => {
          setVacations(prev => prev.map(v => v.id === vacation.id ? { ...v, status: 'cancelled' as const } : v));
          Alert.alert('Done', 'Vacation has been cancelled. Deliveries will resume.');
        }},
      ]
    );
  };

  const renderVacationCard = ({ item }: { item: VacationEntry }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
    const duration = getDaysBetween(item.startDate, item.endDate);
    const progress = getProgress(item.startDate, item.endDate);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: cfg.bg }]}>
              <Icon name={cfg.icon as any} size={18} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.customerName}</Text>
              <Text style={styles.cardSub}>Sub: {item.subscriptionId}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
          </View>
          <Icon name="arrow-right" size={16} color={COLORS.text.muted} />
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
          </View>
          <View style={[styles.durationBadge]}>
            <Text style={styles.durationText}>{duration} days</Text>
          </View>
        </View>

        {(item.status === 'active' || item.status === 'upcoming') && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: cfg.color }]} />
            </View>
            <Text style={styles.progressText}>
              {item.status === 'upcoming' ? 'Not started' : `${Math.round(progress * 100)}% elapsed`}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="text-box-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.infoText}>{item.reason}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="truck-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.infoText}>{item.affectedDeliveries} deliveries affected</Text>
          </View>
        </View>

        {(item.status === 'active' || item.status === 'upcoming') && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item)}>
            <Icon name="close-circle-outline" size={14} color="#C62828" />
            <Text style={styles.cancelBtnText}>Cancel Vacation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="beach" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No vacations found</Text>
      <Text style={styles.emptySub}>
        Customer vacation requests will appear here when they pause their subscriptions
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vacation Management</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="umbrella-beach" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="beach" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="calendar-clock" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="check-circle" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderVacationCard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  cardSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#F9FAFB', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  dateBlock: { alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },
  dateValue: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary, marginTop: 2 },
  durationBadge: { marginLeft: 'auto', backgroundColor: '#E8F5E9', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  durationText: { fontSize: 10, fontWeight: '700', color: '#2E7D32' },

  progressContainer: { marginBottom: SPACING.sm },
  progressBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted, marginTop: 3, textAlign: 'right' },

  infoRow: { gap: SPACING.xs, marginBottom: SPACING.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  infoText: { fontSize: 12, color: COLORS.text.secondary },

  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, marginTop: SPACING.xs },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: '#C62828' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
