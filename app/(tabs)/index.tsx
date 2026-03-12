import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useDeliveries } from '@/context/DeliveryContext';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  pending: { color: '#E65100', bg: '#FFF3E0', icon: 'clock-outline' },
  preparing: { color: '#1565C0', bg: '#E3F2FD', icon: 'food-variant' },
  ready: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle-outline' },
  out_for_delivery: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'truck-delivery-outline' },
  delivered: { color: '#616161', bg: '#F5F5F5', icon: 'package-variant-closed' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { owner } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { subscriptions } = useSubscriptions();
  const { deliveryPersons } = useDeliveries();
  const [refreshing, setRefreshing] = React.useState(false);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      readyOrders: orders.filter(o => o.status === 'ready').length,
      outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
      deliveredToday: orders.filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === today).length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0),
      totalProducts: products.length,
      lowStock: products.filter(p => !p.inStock).length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      availableDrivers: deliveryPersons?.filter(d => d.isAvailable).length || 0,
    };
  }, [orders, products, subscriptions, deliveryPersons]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Hero Header */}
        <LinearGradient colors={['#388E3C', '#4CAF50']} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.ownerName}>{owner?.name || 'Owner'}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Icon name="bell-outline" size={22} color="#FFF" />
              {stats.pendingOrders > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{stats.pendingOrders}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Revenue Card inside hero */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueMain}>
              <Text style={styles.revenueLabel}>Today's Revenue</Text>
              <Text style={styles.revenueAmount}>{'\u20B9'}{stats.todayRevenue.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueMain}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueAmount}>{'\u20B9'}{stats.totalRevenue.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Order Status Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Order Status</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusGrid}>
            <TouchableOpacity style={[styles.statusCard, { backgroundColor: '#FFF3E0' }]} onPress={() => router.push('/(tabs)/orders' as any)}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#FFE0B2' }]}>
                <Icon name="clock-outline" size={22} color="#E65100" />
              </View>
              <Text style={[styles.statusCount, { color: '#E65100' }]}>{stats.pendingOrders}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]} onPress={() => router.push('/(tabs)/orders' as any)}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#BBDEFB' }]}>
                <Icon name="food-variant" size={22} color="#1565C0" />
              </View>
              <Text style={[styles.statusCount, { color: '#1565C0' }]}>{stats.preparingOrders}</Text>
              <Text style={styles.statusLabel}>Preparing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statusCard, { backgroundColor: '#E8F5E9' }]} onPress={() => router.push('/(tabs)/orders' as any)}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#C8E6C9' }]}>
                <Icon name="check-circle-outline" size={22} color="#388E3C" />
              </View>
              <Text style={[styles.statusCount, { color: '#388E3C' }]}>{stats.readyOrders}</Text>
              <Text style={styles.statusLabel}>Ready</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statusCard, { backgroundColor: '#F3E5F5' }]} onPress={() => router.push('/(tabs)/deliveries' as any)}>
              <View style={[styles.statusIconWrap, { backgroundColor: '#E1BEE7' }]}>
                <Icon name="truck-delivery-outline" size={22} color="#7B1FA2" />
              </View>
              <Text style={[styles.statusCount, { color: '#7B1FA2' }]}>{stats.outForDelivery}</Text>
              <Text style={styles.statusLabel}>In Transit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionCard, themed.card]} onPress={() => router.push('/product-form' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="plus-circle" size={24} color="#388E3C" />
              </View>
              <Text style={[styles.actionLabel, themed.textPrimary]}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, themed.card]} onPress={() => router.push('/(tabs)/orders' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="clipboard-list" size={24} color="#E65100" />
              </View>
              <Text style={[styles.actionLabel, themed.textPrimary]}>View Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, themed.card]} onPress={() => router.push('/customers' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="account-group" size={24} color="#1565C0" />
              </View>
              <Text style={[styles.actionLabel, themed.textPrimary]}>Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, themed.card]} onPress={() => router.push('/payments' as any)}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#F3E5F5' }]}>
                <Icon name="wallet" size={24} color="#7B1FA2" />
              </View>
              <Text style={[styles.actionLabel, themed.textPrimary]}>Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Business Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={[styles.overviewCard, themed.card]}>
              <Icon name="food-apple" size={20} color="#4CAF50" />
              <Text style={[styles.overviewValue, themed.textPrimary]}>{stats.totalProducts}</Text>
              <Text style={styles.overviewLabel}>Products</Text>
              {stats.lowStock > 0 && (
                <View style={styles.overviewAlert}>
                  <Icon name="alert-circle" size={12} color="#E53935" />
                  <Text style={styles.overviewAlertText}>{stats.lowStock} out of stock</Text>
                </View>
              )}
            </View>

            <View style={[styles.overviewCard, themed.card]}>
              <Icon name="calendar-sync" size={20} color="#1565C0" />
              <Text style={[styles.overviewValue, themed.textPrimary]}>{stats.activeSubscriptions}</Text>
              <Text style={styles.overviewLabel}>Active Subs</Text>
            </View>

            <View style={[styles.overviewCard, themed.card]}>
              <Icon name="truck-check" size={20} color="#7B1FA2" />
              <Text style={[styles.overviewValue, themed.textPrimary]}>{stats.deliveredToday}</Text>
              <Text style={styles.overviewLabel}>Delivered Today</Text>
            </View>

            <View style={[styles.overviewCard, themed.card]}>
              <Icon name="account-group" size={20} color="#E65100" />
              <Text style={[styles.overviewValue, themed.textPrimary]}>{stats.availableDrivers}</Text>
              <Text style={styles.overviewLabel}>Drivers Available</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={[styles.emptyCard, themed.card]}>
              <Icon name="clipboard-text-outline" size={40} color={COLORS.text.muted} />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            recentOrders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.recentOrderCard, themed.card]}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
                >
                  <View style={[styles.recentOrderIcon, { backgroundColor: config.bg }]}>
                    <Icon name={config.icon as any} size={20} color={config.color} />
                  </View>
                  <View style={styles.recentOrderInfo}>
                    <View style={styles.recentOrderTop}>
                      <Text style={[styles.recentOrderId, themed.textPrimary]}>#ORD-{order.id.slice(-4)}</Text>
                      <View style={[styles.recentStatusBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.recentStatusText, { color: config.color }]}>
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recentOrderCustomer}>{order.customerName}</Text>
                    <View style={styles.recentOrderBottom}>
                      <Text style={styles.recentOrderTime}>
                        <Icon name="clock-outline" size={11} color={COLORS.text.muted} /> {order.deliverySlot}
                      </Text>
                      <Text style={styles.recentOrderTotal}>{'\u20B9'}{order.total}</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 20 },

  /* Hero */
  hero: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.xl + 10 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTextWrap: { flex: 1 },
  greeting: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  ownerName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFF', marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  notifBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  /* Revenue Card */
  revenueCard: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.lg,
  },
  revenueMain: { flex: 1, alignItems: 'center' },
  revenueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  revenueAmount: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 4 },
  revenueDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  /* Sections */
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.sm },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  /* Status Grid */
  statusGrid: { flexDirection: 'row', gap: SPACING.sm, marginTop: -SPACING.xxl },
  statusCard: {
    flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  statusIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  statusCount: { fontSize: 20, fontWeight: '800' },
  statusLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* Quick Actions */
  actionsRow: { flexDirection: 'row', gap: SPACING.sm },
  actionCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', ...SHADOW.sm,
  },
  actionIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  actionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center' },

  /* Overview Grid */
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  overviewCard: {
    width: '48%', flexGrow: 1, backgroundColor: '#FFF', borderRadius: RADIUS.lg,
    padding: SPACING.base, ...SHADOW.sm,
  },
  overviewValue: { fontSize: 24, fontWeight: '800', marginTop: 6 },
  overviewLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },
  overviewAlert: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  overviewAlertText: { fontSize: 10, color: '#E53935', fontWeight: '600' },

  /* Recent Orders */
  recentOrderCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  recentOrderIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  recentOrderInfo: { flex: 1 },
  recentOrderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentOrderId: { fontSize: 14, fontWeight: '800' },
  recentStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  recentStatusText: { fontSize: 10, fontWeight: '700' },
  recentOrderCustomer: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  recentOrderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  recentOrderTime: { fontSize: 11, color: COLORS.text.muted },
  recentOrderTotal: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  /* Empty */
  emptyCard: {
    backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', ...SHADOW.sm,
  },
  emptyText: { fontSize: 13, color: COLORS.text.muted, marginTop: SPACING.sm },
});
