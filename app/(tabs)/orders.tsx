import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, RefreshControl, Alert, Vibration, TextInput,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();
  const themed = useThemedStyles();
  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    pending: { ...STATUS_CONFIG_COLORS.pending, bg: themed.colors.accentBg.orange },
    preparing: { ...STATUS_CONFIG_COLORS.preparing, bg: themed.colors.accentBg.blue },
    ready: { ...STATUS_CONFIG_COLORS.ready, bg: themed.colors.accentBg.green },
    out_for_delivery: { ...STATUS_CONFIG_COLORS.out_for_delivery, bg: themed.colors.accentBg.purple },
    delivered: { ...STATUS_CONFIG_COLORS.delivered, bg: themed.colors.accentBg.gray },
    cancelled: { ...STATUS_CONFIG_COLORS.cancelled, bg: themed.colors.accentBg.red },
  };
  const { orders, refreshOrders, updateOrderStatus } = useOrders();
  const { handleScroll } = useTabBar();
  const [activeFilter, setActiveFilter] = useState<OwnerOrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (filterParam && STATUS_FILTERS.some(f => f.key === filterParam)) {
      setActiveFilter(filterParam as OwnerOrderStatus | 'all');
    }
  }, [filterParam]);

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
    let result = orders;
    if (activeFilter !== 'all') {
      result = result.filter(o => o.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q)
      );
    }
    return result;
  }, [orders, activeFilter, search]);

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);

  const handleAcceptAllPending = () => {
    if (pendingOrders.length === 0) return;
    Alert.alert(
      'Accept All Pending Orders?',
      `This will move ${pendingOrders.length} order${pendingOrders.length !== 1 ? 's' : ''} to Preparing status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept All',
          onPress: async () => {
            try {
              await Promise.all(
                pendingOrders.map(o => updateOrderStatus(o.id, 'preparing'))
              );
              Vibration.vibrate(100);
              Alert.alert('Success', `${pendingOrders.length} order${pendingOrders.length !== 1 ? 's' : ''} moved to Preparing.`);
            } catch {
              Alert.alert('Error', 'Failed to update some orders. Please try again.');
            }
          },
        },
      ],
    );
  };

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
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#E8F5E9', zIndex: 10 }} />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, themed.textPrimary]}>Orders</Text>
            <Text style={[styles.headerSub, themed.textSecondary]}>Manage incoming orders</Text>
          </View>
          <View style={styles.headerActions}>
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

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: themed.colors.card }]}>
          <Icon name="magnify" size={20} color={COLORS.text.muted} />
          <TextInput
            style={[styles.searchInput, { color: themed.colors.text.primary }]}
            placeholder="Search by name, ID, or phone..."
            placeholderTextColor={COLORS.text.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList} style={styles.filterScroll}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, { backgroundColor: themed.colors.card }, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              {search.trim()
                ? `No orders matching "${search}"`
                : activeFilter === 'all'
                  ? 'Orders will appear here when customers place them'
                  : `No ${activeFilter.replace(/_/g, ' ')} orders right now`}
            </Text>
          </View>
        }
        ListFooterComponent={
          activeFilter === 'pending' && pendingOrders.length > 0 ? (
            <TouchableOpacity style={styles.acceptAllBtn} onPress={handleAcceptAllPending}>
              <Icon name="check-all" size={20} color="#FFF" />
              <Text style={styles.acceptAllText}>Accept All Pending ({pendingOrders.length})</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: { paddingHorizontal: SPACING.base, paddingTop: (StatusBar.currentHeight || 0) + SPACING.md, paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
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

  /* Search */
  searchWrap: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 4 },

  /* Filters */
  filterScroll: { marginTop: SPACING.sm, flexGrow: 0, flexShrink: 0 },
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

  /* Accept All Pending */
  acceptAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#388E3C', borderRadius: RADIUS.lg, padding: 14,
    marginHorizontal: SPACING.base, marginTop: SPACING.md, marginBottom: SPACING.lg, ...SHADOW.sm,
  },
  acceptAllText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
