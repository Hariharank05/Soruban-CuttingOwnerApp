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
import { useTabBar } from '@/context/TabBarContext';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

const STATUS_CONFIG_BASE: Record<string, { color: string; icon: string; bgKey: keyof typeof COLORS.accentBg }> = {
  pending: { color: '#E65100', icon: 'clock-outline', bgKey: 'orange' },
  preparing: { color: '#1565C0', icon: 'food-variant', bgKey: 'blue' },
  ready: { color: '#388E3C', icon: 'check-circle-outline', bgKey: 'green' },
  out_for_delivery: { color: '#7B1FA2', icon: 'truck-delivery-outline', bgKey: 'purple' },
  delivered: { color: '#616161', icon: 'package-variant-closed', bgKey: 'gray' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { owner } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { subscriptions } = useSubscriptions();
  const { deliveryPersons } = useDeliveries();
  const { handleScroll } = useTabBar();
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

  const initials = useMemo(() => {
    const name = owner?.name || 'O';
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  }, [owner]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themed.colors.primary} />}
      >
        {/* ── Hero Header ── */}
        <LinearGradient colors={themed.headerGradient} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTextWrap}>
              <Text style={[styles.greeting, themed.textSecondary]}>{greeting},</Text>
              <Text style={[styles.ownerName, themed.textPrimary]}>{owner?.name || 'Owner'}</Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity style={[styles.notifBtn, { backgroundColor: themed.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]} onPress={() => router.push('/notifications' as any)}>
                <Icon name="bell-outline" size={22} color={themed.colors.text.primary} />
                {stats.pendingOrders > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{stats.pendingOrders}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/more' as any)}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Revenue Card ── */}
        <View style={styles.revenueWrap}>
          <View style={styles.revenueCard}>
            <LinearGradient
              colors={['#2E7D32', '#43A047']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revenueGradient}
            >
              <View style={styles.revenueRow}>
                <View style={styles.revenueCol}>
                  <View style={styles.revenueLabelRow}>
                    <Icon name="chart-line" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.revenueLabel}>Today</Text>
                  </View>
                  <Text style={styles.revenueAmount}>{'\u20B9'}{stats.todayRevenue.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueCol}>
                  <View style={styles.revenueLabelRow}>
                    <Icon name="finance" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                  </View>
                  <Text style={styles.revenueAmount}>{'\u20B9'}{stats.totalRevenue.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <View style={styles.revenueFooter}>
                <Icon name="trending-up" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.revenueFooterText}>{stats.deliveredToday} orders delivered today</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* ── Order Status Card ── */}
        <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleDot, { backgroundColor: '#E65100' }]} />
                <Text style={[styles.cardTitle, themed.textPrimary]}>Order Status</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)} style={styles.cardLink}>
                <Text style={[styles.cardLinkText, { color: themed.colors.primary }]}>See All</Text>
                <Icon name="chevron-right" size={16} color={themed.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.statusGrid}>
              {[
                { count: stats.pendingOrders, label: 'Pending', icon: 'clock-outline', color: '#E65100', bg: themed.colors.accentBg.orange, accent: themed.colors.accentBg.orange, route: '/(tabs)/orders' },
                { count: stats.preparingOrders, label: 'Preparing', icon: 'food-variant', color: '#1565C0', bg: themed.colors.accentBg.blue, accent: themed.colors.accentBg.blue, route: '/(tabs)/orders' },
                { count: stats.readyOrders, label: 'Ready', icon: 'check-circle-outline', color: '#388E3C', bg: themed.colors.accentBg.green, accent: themed.colors.accentBg.green, route: '/(tabs)/orders' },
                { count: stats.outForDelivery, label: 'In Transit', icon: 'truck-delivery-outline', color: '#7B1FA2', bg: themed.colors.accentBg.purple, accent: themed.colors.accentBg.purple, route: '/(tabs)/deliveries' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.statusCard, { backgroundColor: item.bg }]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.statusIconWrap, { backgroundColor: item.accent }]}>
                    <Icon name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.statusCount, { color: item.color }]}>{item.count}</Text>
                  <Text style={[styles.statusLabel, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Quick Actions Card ── */}
        <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleDot, { backgroundColor: themed.colors.accent }]} />
                <Text style={[styles.cardTitle, themed.textPrimary]}>Quick Actions</Text>
              </View>
            </View>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'plus-circle-outline', label: 'Add Product', color: '#388E3C', bg: themed.colors.accentBg.green, route: '/product-form' },
                { icon: 'clipboard-list-outline', label: 'Orders', color: '#E65100', bg: themed.colors.accentBg.orange, route: '/(tabs)/orders' },
                { icon: 'account-group-outline', label: 'Customers', color: '#1565C0', bg: themed.colors.accentBg.blue, route: '/customers' },
                { icon: 'wallet-outline', label: 'Payments', color: '#7B1FA2', bg: themed.colors.accentBg.purple, route: '/payments' },
                { icon: 'package-variant', label: 'Packs', color: '#C62828', bg: themed.colors.accentBg.red, route: '/packs' },
                { icon: 'sale', label: 'Offers', color: '#00838F', bg: themed.colors.accentBg.cyan, route: '/offers' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionItem}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: item.bg }]}>
                    <Icon name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.actionLabel, themed.textPrimary]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Business Overview Card ── */}
        <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleDot, { backgroundColor: '#1565C0' }]} />
                <Text style={[styles.cardTitle, themed.textPrimary]}>Business Overview</Text>
              </View>
            </View>
            <View style={styles.overviewGrid}>
              {[
                { icon: 'food-apple', label: 'Products', value: stats.totalProducts, color: '#388E3C', bg: themed.colors.accentBg.green, alert: stats.lowStock > 0 ? `${stats.lowStock} out of stock` : null },
                { icon: 'calendar-sync', label: 'Active Subs', value: stats.activeSubscriptions, color: '#1565C0', bg: themed.colors.accentBg.blue, alert: null },
                { icon: 'truck-check', label: 'Delivered Today', value: stats.deliveredToday, color: '#7B1FA2', bg: themed.colors.accentBg.purple, alert: null },
                { icon: 'motorbike', label: 'Drivers Online', value: stats.availableDrivers, color: '#E65100', bg: themed.colors.accentBg.orange, alert: null },
              ].map((item) => (
                <View key={item.label} style={[styles.overviewItem, { borderBottomColor: themed.colors.divider }]}>
                  <View style={[styles.overviewIconWrap, { backgroundColor: item.bg }]}>
                    <Icon name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={styles.overviewTextCol}>
                    <Text style={[styles.overviewValue, themed.textPrimary]}>{item.value}</Text>
                    <Text style={[styles.overviewLabel, { color: themed.colors.text.secondary }]}>{item.label}</Text>
                  </View>
                  {item.alert && (
                    <View style={styles.overviewAlert}>
                      <View style={styles.alertDot} />
                      <Text style={styles.overviewAlertText}>{item.alert}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Recent Orders Card ── */}
        <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardTitleDot, { backgroundColor: '#7B1FA2' }]} />
                <Text style={[styles.cardTitle, themed.textPrimary]}>Recent Orders</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)} style={styles.cardLink}>
                <Text style={[styles.cardLinkText, { color: themed.colors.primary }]}>See All</Text>
                <Icon name="chevron-right" size={16} color={themed.colors.primary} />
              </TouchableOpacity>
            </View>

            {recentOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="clipboard-text-outline" size={40} color={themed.colors.text.muted} />
                <Text style={[styles.emptyText, { color: themed.colors.text.muted }]}>No orders yet</Text>
              </View>
            ) : (
              recentOrders.map((order, idx) => {
                const base = STATUS_CONFIG_BASE[order.status] || STATUS_CONFIG_BASE.pending;
                const config = { ...base, bg: themed.colors.accentBg[base.bgKey] };
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderRow, idx < recentOrders.length - 1 && styles.orderRowBorder, idx < recentOrders.length - 1 && { borderBottomColor: themed.colors.divider }]}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
                  >
                    <View style={[styles.orderIcon, { backgroundColor: config.bg }]}>
                      <Icon name={config.icon as any} size={18} color={config.color} />
                    </View>
                    <View style={styles.orderInfo}>
                      <View style={styles.orderTopRow}>
                        <Text style={[styles.orderId, themed.textPrimary]}>#ORD-{order.id.slice(-4)}</Text>
                        <View style={[styles.orderBadge, { backgroundColor: config.bg }]}>
                          <View style={[styles.badgeDot, { backgroundColor: config.color }]} />
                          <Text style={[styles.badgeText, { color: config.color }]}>
                            {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.orderCustomer, { color: themed.colors.text.secondary }]}>{order.customerName}</Text>
                      <View style={styles.orderBottomRow}>
                        <View style={styles.orderTimePill}>
                          <Icon name="clock-outline" size={11} color={themed.colors.text.muted} />
                          <Text style={[styles.orderTime, { color: themed.colors.text.muted }]}>{order.deliverySlot}</Text>
                        </View>
                        <Text style={[styles.orderTotal, { color: themed.colors.primary }]}>{'\u20B9'}{order.total}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-right" size={18} color={themed.colors.text.muted} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 20 },

  /* ── Hero ── */
  hero: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTextWrap: { flex: 1 },
  greeting: { fontSize: FONTS.sizes.md, fontWeight: '500' },
  ownerName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', marginTop: 2 },
  heroActions: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  notifBadge: {
    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  notifBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  /* ── Revenue Card ── */
  revenueWrap: { paddingHorizontal: SPACING.base, marginTop: SPACING.sm },
  revenueCard: { borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.md },
  revenueGradient: { padding: SPACING.base },
  revenueRow: { flexDirection: 'row', alignItems: 'center' },
  revenueCol: { flex: 1 },
  revenueLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  revenueLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  revenueAmount: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 4 },
  revenueDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: SPACING.md },
  revenueFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: SPACING.sm, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
  },
  revenueFooterText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },

  /* ── Card Sections ── */
  cardSection: { paddingHorizontal: SPACING.base, marginTop: SPACING.md },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base, ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardTitleDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardLinkText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* ── Status Grid ── */
  statusGrid: { flexDirection: 'row', gap: SPACING.sm },
  statusCard: {
    flex: 1, borderRadius: RADIUS.lg, paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  statusCount: { fontSize: 20, fontWeight: '800' },
  statusLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  /* ── Quick Actions ── */
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  actionItem: {
    width: '33.33%', alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  /* ── Business Overview ── */
  overviewGrid: { gap: 0 },
  overviewItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  overviewIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  overviewTextCol: { flex: 1 },
  overviewValue: { fontSize: 18, fontWeight: '800' },
  overviewLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, marginTop: 1 },
  overviewAlert: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935' },
  overviewAlertText: { fontSize: 10, color: '#E53935', fontWeight: '600' },

  /* ── Recent Orders ── */
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  orderRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  orderIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  orderInfo: { flex: 1 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '800' },
  orderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  orderCustomer: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  orderTimePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  orderTime: { fontSize: 11, color: COLORS.text.muted },
  orderTotal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  /* ── Empty ── */
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyText: { fontSize: 13, color: COLORS.text.muted, marginTop: SPACING.sm },
});
