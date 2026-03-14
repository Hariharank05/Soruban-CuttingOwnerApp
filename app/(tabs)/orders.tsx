import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { Order, OwnerOrderStatus } from '@/types';
import { useTabBar } from '@/context/TabBarContext';

const STATUS_FILTERS: { key: OwnerOrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_CONFIG_COLORS: Record<string, { color: string; icon: string }> = {
  pending: { color: '#E65100', icon: 'clock-outline' },
  preparing: { color: '#1565C0', icon: 'food-variant' },
  ready: { color: '#388E3C', icon: 'check-circle-outline' },
  out_for_delivery: { color: '#7B1FA2', icon: 'truck-delivery-outline' },
  delivered: { color: '#616161', icon: 'package-variant-closed' },
  cancelled: { color: '#C62828', icon: 'close-circle-outline' },
};

function StatCard({ icon, count, label, color, bg }: { icon: string; count: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Icon name={icon as any} size={22} color={color} />
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function OrdersDashboard() {
  const router = useRouter();
  const themed = useThemedStyles();
  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    pending: { ...STATUS_CONFIG_COLORS.pending, bg: themed.colors.accentBg.orange },
    preparing: { ...STATUS_CONFIG_COLORS.preparing, bg: themed.colors.accentBg.blue },
    ready: { ...STATUS_CONFIG_COLORS.ready, bg: themed.colors.accentBg.green },
    out_for_delivery: { ...STATUS_CONFIG_COLORS.out_for_delivery, bg: themed.colors.accentBg.purple },
    delivered: { ...STATUS_CONFIG_COLORS.delivered, bg: themed.colors.accentBg.gray },
    cancelled: { ...STATUS_CONFIG_COLORS.cancelled, bg: themed.colors.accentBg.red },
  };
  const { orders, refreshOrders } = useOrders();
  const { handleScroll } = useTabBar();
  const [activeFilter, setActiveFilter] = useState<OwnerOrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      deliveredToday: orders.filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === today).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter(o => o.status === activeFilter);
  }, [orders, activeFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrders?.();
    setRefreshing(false);
  }, [refreshOrders]);

  const renderOrder = useCallback(({ item }: { item: Order }) => {
    const config = statusConfig[item.status] || statusConfig['pending'];
    const itemsSummary = item.items
      ?.slice(0, 3)
      .map(i => `${i.name}${i.cutType ? ` (${i.cutType})` : ''}`)
      .join(', ');
    const moreCount = (item.items?.length || 0) - 3;

    return (
      <TouchableOpacity
        style={[styles.orderCard, themed.card]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/order-detail', params: { id: item.id } })}
      >
        <View style={styles.orderTopRow}>
          <View style={styles.orderIdRow}>
            <Icon name="receipt" size={16} color={COLORS.primary} />
            <Text style={styles.orderId}>#ORD-{item.id.slice(-4)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {item.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={styles.customerRow}>
          <Icon name="account-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          {item.customerPhone && (
            <>
              <Icon name="phone-outline" size={14} color={COLORS.text.muted} style={{ marginLeft: 8 }} />
              <Text style={styles.customerPhone}>{item.customerPhone}</Text>
            </>
          )}
        </View>

        <View style={styles.itemsRow}>
          <Icon name="food-apple-outline" size={14} color={COLORS.text.muted} />
          <Text style={styles.itemsText} numberOfLines={2}>
            {itemsSummary}{moreCount > 0 ? ` +${moreCount} more` : ''}
          </Text>
        </View>

        <View style={styles.orderBottomRow}>
          <View style={styles.timeSlotRow}>
            <Icon name="clock-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.timeSlotText}>{item.deliverySlot || 'Flexible'}</Text>
          </View>
          <Text style={styles.orderTotal}>{'\u20B9'}{item.total || 0}</Text>
        </View>

        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  }, [themed, router, statusConfig]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, themed.textPrimary]}>Orders</Text>
            <Text style={[styles.headerSub, themed.textSecondary]}>Manage incoming orders</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.createPackBtn}
              onPress={() => router.push('/pack-form' as any)}
            >
              <Icon name="package-variant" size={18} color="#FFF" />
              <Text style={styles.createPackText}>Pack</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bellBtn, { backgroundColor: themed.colors.accentBg.gray }]}
              onPress={() => router.push('/notifications' as any)}
            >
              <Icon name="bell-outline" size={24} color={COLORS.text.primary} />
              {stats.pending > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{stats.pending}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      {/* <View style={styles.statsGrid}>
        <StatCard icon="clock-outline" count={stats.pending} label="Pending" color="#E65100" bg="#FFF3E0" />
        <StatCard icon="food-variant" count={stats.preparing} label="Preparing" color="#1565C0" bg="#E3F2FD" />
        <StatCard icon="check-circle-outline" count={stats.ready} label="Ready" color="#388E3C" bg="#E8F5E9" />
        <StatCard icon="truck-check-outline" count={stats.deliveredToday} label="Delivered" color="#4CAF50" bg="#E8F5E9" />
      </View> */}

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
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

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-outline" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'all' ? 'Orders will appear here when customers place them' : `No ${activeFilter.replace(/_/g, ' ')} orders right now`}
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
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  createPackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, ...SHADOW.sm,
  },
  createPackText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  bellBadge: { position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  bellBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, marginTop: SPACING.md, gap: SPACING.sm },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  statCount: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* Filters */
  filterScroll: { marginTop: SPACING.md, flexGrow: 0, flexShrink: 0 },
  filterList: { paddingHorizontal: SPACING.base, gap: SPACING.sm, alignItems: 'center' },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  filterChipTextActive: { color: COLORS.primary },

  /* Order List */
  list: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: 100 },

  /* Order Card */
  orderCard: {
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, ...SHADOW.sm,
  },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  customerName: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  customerPhone: { fontSize: 12, color: COLORS.text.muted },

  itemsRow: { flexDirection: 'row', gap: 6, marginBottom: SPACING.sm, paddingRight: SPACING.lg },
  itemsText: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 17, flex: 1 },

  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  timeSlotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeSlotText: { fontSize: 12, color: COLORS.text.muted },
  orderTotal: { fontSize: 17, fontWeight: '800', color: COLORS.primary },

  viewDetailsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  viewDetailsText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  /* Empty State */
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: SPACING.xxl },
});
