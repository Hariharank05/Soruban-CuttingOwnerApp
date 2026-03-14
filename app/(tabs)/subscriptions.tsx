import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Subscription } from '@/types';
import { useTabBar } from '@/context/TabBarContext';

type FilterKey = 'all' | 'active' | 'paused' | 'cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'cancelled', label: 'Cancelled' },
];

const getFreqConfig = (colors: any): Record<string, { color: string; bg: string }> => ({
  daily: { color: '#388E3C', bg: colors.accentBg.green },
  weekly: { color: '#1565C0', bg: colors.accentBg.blue },
  monthly: { color: '#7B1FA2', bg: colors.accentBg.purple },
});

const getStatusColors = (colors: any): Record<string, { color: string; bg: string }> => ({
  active: { color: '#388E3C', bg: colors.accentBg.green },
  paused: { color: '#E65100', bg: colors.accentBg.orange },
  cancelled: { color: '#C62828', bg: colors.accentBg.red },
});

function SummaryCard({ icon, count, label, color, bg }: { icon: string; count: number | string; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
      <Icon name={icon as any} size={24} color={color} />
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export default function SubscriptionsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { subscriptions } = useSubscriptions();
  const { handleScroll } = useTabBar();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const FREQ_CONFIG = useMemo(() => getFreqConfig(themed.colors), [themed.colors]);
  const STATUS_COLORS = useMemo(() => getStatusColors(themed.colors), [themed.colors]);

  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active').length;
    const paused = subscriptions.filter(s => s.status === 'paused').length;
    const monthlyRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const base = s.totalAmount || 0;
        if (s.frequency === 'daily') return sum + base * 30;
        if (s.frequency === 'weekly') return sum + base * 4;
        return sum + base; // monthly
      }, 0);
    return { active, paused, monthlyRevenue };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return subscriptions;
    return subscriptions.filter(s => s.status === activeFilter);
  }, [subscriptions, activeFilter]);

  const renderSubscription = ({ item }: { item: Subscription }) => {
    const freq = FREQ_CONFIG[item.frequency] || FREQ_CONFIG.daily;
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.active;

    return (
      <TouchableOpacity
        style={[styles.subCard, themed.card]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/subscription-detail', params: { id: item.id } } as any)}
      >
        {/* Top row: Customer + Status */}
        <View style={styles.subTopRow}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarWrap}>
              <Icon name="account" size={18} color="#FFF" />
            </View>
            <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Frequency badge */}
        <View style={styles.freqRow}>
          <View style={[styles.freqBadge, { backgroundColor: freq.bg }]}>
            <Icon name="calendar-sync" size={14} color={freq.color} />
            <Text style={[styles.freqText, { color: freq.color }]}>
              {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            </Text>
          </View>
          {item.status === 'paused' && item.pausedUntil && (
            <Text style={styles.pausedInfo}>
              Paused until {new Date(item.pausedUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.itemsList}>
          {item.items?.slice(0, 3).map((si, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText} numberOfLines={1}>
                {si.name || 'Item'} {si.quantity ? `x${si.quantity}` : ''}
                {si.cutType ? ` (${si.cutType})` : ''}
              </Text>
            </View>
          ))}
          {(item.items?.length || 0) > 3 && (
            <Text style={styles.moreItems}>+{(item.items?.length || 0) - 3} more items</Text>
          )}
        </View>

        {/* Bottom row */}
        <View style={styles.subBottomRow}>
          <View style={styles.nextDeliveryRow}>
            <Icon name="clock-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.nextDeliveryText}>
              Time: {item.preferredTime || 'Not scheduled'}
            </Text>
          </View>
          <Text style={styles.subTotal}>{'\u20B9'}{item.totalAmount || 0}/delivery</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <Text style={[styles.headerTitle, themed.textPrimary]}>Subscriptions</Text>
        <Text style={[styles.headerSub, themed.textSecondary]}>Recurring customer orders</Text>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <SummaryCard icon="play-circle-outline" count={stats.active} label="Active" color="#388E3C" bg={themed.colors.accentBg.green} />
        <SummaryCard icon="pause-circle-outline" count={stats.paused} label="Paused" color="#E65100" bg={themed.colors.accentBg.orange} />
        <SummaryCard
          icon="currency-inr"
          count={stats.monthlyRevenue > 1000 ? `${(stats.monthlyRevenue / 1000).toFixed(1)}K` : `${stats.monthlyRevenue}`}
          label="Monthly Rev"
          color="#1565C0"
          bg={themed.colors.accentBg.blue}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: themed.colors.card }, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Subscription List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderSubscription}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank-outline" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No subscriptions</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'all'
                ? 'Customer subscriptions will appear here'
                : `No ${activeFilter} subscriptions found`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  headerSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },

  /* Summary */
  summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
  summaryCard: {
    flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  summaryCount: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* Filters */
  filterWrap: { flexGrow: 0, flexShrink: 0 },
  filterList: { paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingVertical: SPACING.md, alignItems: 'center' },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  filterChipTextActive: { color: COLORS.primary },

  /* List */
  list: { paddingHorizontal: SPACING.base, paddingBottom: 100 },

  /* Subscription Card */
  subCard: {
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, ...SHADOW.sm,
  },
  subTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },

  freqRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  freqBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  freqText: { fontSize: 12, fontWeight: '700' },
  pausedInfo: { fontSize: 11, fontWeight: '600', color: '#E65100', fontStyle: 'italic' },

  itemsList: { marginBottom: SPACING.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  itemDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  itemText: { fontSize: 12, color: COLORS.text.secondary, flex: 1 },
  moreItems: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic', marginLeft: 11, marginTop: 2 },

  subBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextDeliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nextDeliveryText: { fontSize: 12, color: COLORS.text.muted },
  subTotal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: SPACING.xxl },
});
