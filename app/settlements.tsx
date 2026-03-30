// app/settlements.tsx - Settlement Tracking Screen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { loadSettlements } from '@/src/utils/localJsonStorage';
import type { Settlement } from '@/types';

function getStatusColor(status: Settlement['status']): string {
  switch (status) {
    case 'pending': return '#FF6F00';
    case 'processed': return '#1565C0';
    case 'paid': return '#2E7D32';
    default: return COLORS.text.muted;
  }
}

function getStatusLabel(status: Settlement['status']): string {
  switch (status) {
    case 'pending': return 'PENDING';
    case 'processed': return 'PROCESSED';
    case 'paid': return 'PAID';
    default: return String(status).toUpperCase();
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processed', label: 'Processed' },
  { key: 'paid', label: 'Paid' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function SettlementCard({
  settlement,
  expanded,
  onToggleExpand,
}: {
  settlement: Settlement;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const statusColor = getStatusColor(settlement.status);
  const statusLabel = getStatusLabel(settlement.status);

  return (
    <View style={styles.card}>
      {/* Top row: Date + Status badge */}
      <View style={styles.cardTopRow}>
        <View style={styles.dateRow}>
          <Icon name="calendar" size={16} color={COLORS.text.secondary} />
          <Text style={styles.dateText}>{formatDate(settlement.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Financial breakdown */}
      <View style={styles.breakdownSection}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Sales</Text>
          <Text style={styles.breakdownValue}>{'\u20B9'}{settlement.totalSales.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Deductions</Text>
          <Text style={[styles.breakdownValue, { color: COLORS.status.error }]}>
            -{'\u20B9'}{settlement.totalDeductions.toLocaleString('en-IN')}
          </Text>
        </View>
        {settlement.commissionAmount != null && settlement.commissionAmount > 0 && (
          <>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Commission{settlement.commissionRate != null ? ` (${settlement.commissionRate}%)` : ''}
              </Text>
              <Text style={[styles.breakdownValue, { color: COLORS.status.warning }]}>
                -{'\u20B9'}{settlement.commissionAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          </>
        )}
        <View style={[styles.breakdownRow, styles.netRow]}>
          <Text style={styles.netLabel}>Net Amount</Text>
          <Text style={styles.netValue}>{'\u20B9'}{settlement.netAmount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Bottom row: Orders count + Transaction ID */}
      <View style={styles.cardBottomRow}>
        <View style={styles.ordersCountRow}>
          <Icon name="shopping-outline" size={14} color={COLORS.text.muted} />
          <Text style={styles.ordersCountText}>{settlement.orders.length} orders</Text>
        </View>
        {settlement.transactionId && (
          <View style={styles.txnRow}>
            <Icon name="check-decagram" size={14} color={COLORS.primary} />
            <Text style={styles.txnText} numberOfLines={1}>
              TXN: {settlement.transactionId}
            </Text>
          </View>
        )}
      </View>

      {/* Expand / Collapse toggle */}
      {settlement.orders.length > 0 && (
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={onToggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.expandToggleText}>
            {expanded ? 'Hide Orders' : 'View Orders'}
          </Text>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}

      {/* Expanded order list */}
      {expanded && (
        <View style={styles.expandedOrders}>
          {settlement.orders.map((orderId, index) => (
            <View key={orderId} style={styles.expandedOrderRow}>
              <Icon name="receipt" size={14} color={COLORS.text.muted} />
              <Text style={styles.expandedOrderText}>Order {index + 1}</Text>
              <Text style={styles.expandedOrderId} numberOfLines={1}>{orderId}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SettlementsScreen() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSettlements().then(setSettlements);
  }, []);

  // Summary calculations
  const summary = useMemo(() => {
    const totalPaid = settlements
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.netAmount, 0);
    const totalPending = settlements
      .filter(s => s.status === 'pending' || s.status === 'processed')
      .reduce((sum, s) => sum + s.netAmount, 0);
    const lastPaid = settlements
      .filter(s => s.status === 'paid')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      totalPaid,
      totalPending,
      lastSettlementDate: lastPaid ? formatDate(lastPaid.date) : 'N/A',
    };
  }, [settlements]);

  // Quick stats calculations
  const quickStats = useMemo(() => {
    const totalRevenue = settlements.reduce((sum, s) => sum + s.totalSales, 0);
    const totalCommission = settlements.reduce((sum, s) => sum + (s.commissionAmount ?? 0), 0);
    const netEarnings = settlements.reduce((sum, s) => sum + s.netAmount, 0);
    return { totalRevenue, totalCommission, netEarnings };
  }, [settlements]);

  // Filtered settlements
  const filteredSettlements = useMemo(() => {
    if (activeFilter === 'all') return settlements;
    return settlements.filter(s => s.status === activeFilter);
  }, [settlements, activeFilter]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="bank-transfer" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No settlements yet</Text>
      <Text style={styles.emptySub}>
        Settlement records will appear here once orders are processed
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      {/* ===== HEADER ===== */}
      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settlements</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ===== FILTER PILLS ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterContainer}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredSettlements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <>
            {/* ===== BALANCE OVERVIEW CARD ===== */}
            <LinearGradient
              colors={COLORS.gradient.primary}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceTopRow}>
                <View style={styles.balanceMainCol}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>
                    {'\u20B9'}{summary.totalPending.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Icon name="wallet-outline" size={36} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.balanceInfoRow}>
                <View style={styles.balanceInfoItem}>
                  <Icon name="calendar-clock" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.balanceInfoLabel}>Next Settlement</Text>
                  <Text style={styles.balanceInfoValue}>Weekly</Text>
                </View>
                <View style={styles.balanceInfoDivider} />
                <View style={styles.balanceInfoItem}>
                  <Icon name="refresh" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.balanceInfoLabel}>Settlement Cycle</Text>
                  <Text style={styles.balanceInfoValue}>Every Monday</Text>
                </View>
              </View>
            </LinearGradient>

            {/* ===== QUICK STATS ROW ===== */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatItem}>
                <Icon name="trending-up" size={18} color={COLORS.primary} />
                <Text style={styles.quickStatLabel}>Total Revenue</Text>
                <Text style={styles.quickStatValue}>
                  {'\u20B9'}{quickStats.totalRevenue.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Icon name="percent-outline" size={18} color={COLORS.status.warning} />
                <Text style={styles.quickStatLabel}>Commission</Text>
                <Text style={[styles.quickStatValue, { color: COLORS.status.warning }]}>
                  {'\u20B9'}{quickStats.totalCommission.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Icon name="cash-check" size={18} color="#2E7D32" />
                <Text style={styles.quickStatLabel}>Net Earnings</Text>
                <Text style={[styles.quickStatValue, { color: '#2E7D32' }]}>
                  {'\u20B9'}{quickStats.netEarnings.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* ===== SUMMARY CARD ===== */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: '#2E7D32' }]} />
                  <Text style={styles.summaryLabel}>Total Paid</Text>
                  <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
                    {'\u20B9'}{summary.totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: '#FF6F00' }]} />
                  <Text style={styles.summaryLabel}>Total Pending</Text>
                  <Text style={[styles.summaryValue, { color: '#FF6F00' }]}>
                    {'\u20B9'}{summary.totalPending.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              <View style={styles.lastSettlementRow}>
                <Icon name="clock-outline" size={14} color={COLORS.text.muted} />
                <Text style={styles.lastSettlementText}>
                  Last Settlement: {summary.lastSettlementDate}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SettlementCard
            settlement={item}
            expanded={expandedIds.has(item.id)}
            onToggleExpand={() => toggleExpanded(item.id)}
          />
        )}
      />
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

  // --- Filter Pills ---
  filterContainer: {
    minHeight: 52,
    maxHeight: 52,
    backgroundColor: COLORS.background,
  },
  filterRow: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterPillInactive: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterTextInactive: {
    color: COLORS.text.secondary,
  },

  // --- List ---
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxxl,
  },

  // --- Balance Overview Card ---
  balanceCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOW.md,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
  },
  balanceMainCol: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  balanceInfoRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: SPACING.md,
  },
  balanceInfoItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  balanceInfoDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  balanceInfoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  balanceInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },

  // --- Quick Stats Row ---
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOW.sm,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },

  // --- Summary Card ---
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOW.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  lastSettlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
  },
  lastSettlementText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: '500',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // --- Breakdown ---
  breakdownSection: {
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  netRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: 0,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  netValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.primary,
  },

  // --- Bottom Row ---
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  ordersCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ordersCountText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: SPACING.sm,
  },
  txnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // --- Expand Toggle ---
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // --- Expanded Orders ---
  expandedOrders: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  expandedOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  expandedOrderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  expandedOrderId: {
    fontSize: 11,
    color: COLORS.text.muted,
    flex: 1,
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
