import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, RefreshControl, Dimensions, Vibration, Platform,
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
import SidebarDrawer from '@/components/SidebarDrawer';
import { useReviews } from '@/context/ReviewContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_CONFIG_BASE: Record<string, { color: string; icon: string; bgKey: keyof typeof COLORS.accentBg }> = {
  pending: { color: '#E65100', icon: 'clock-outline', bgKey: 'orange' },
  preparing: { color: '#1565C0', icon: 'food-variant', bgKey: 'blue' },
  ready: { color: '#388E3C', icon: 'check-circle-outline', bgKey: 'green' },
  out_for_delivery: { color: '#7B1FA2', icon: 'truck-delivery-outline', bgKey: 'purple' },
  delivered: { color: '#616161', icon: 'package-variant-closed', bgKey: 'gray' },
};

type BusinessTab = 'Sales' | 'Feedback' | 'Customers';

export default function DashboardScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { owner } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { subscriptions } = useSubscriptions();
  const { deliveryPersons } = useDeliveries();
  const { handleScroll } = useTabBar();
  const { reviews, orderRatings } = useReviews();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeBusinessTab, setActiveBusinessTab] = useState<BusinessTab>('Sales');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const prevPendingCount = useRef(0);

  // Vibrate when new pending orders arrive
  const pendingCount = useMemo(() => orders.filter(o => o.status === 'pending').length, [orders]);
  useEffect(() => {
    if (pendingCount > prevPendingCount.current && prevPendingCount.current !== 0) {
      Vibration.vibrate(Platform.OS === 'android' ? [0, 200, 100, 200] : 400);
    }
    prevPendingCount.current = pendingCount;
  }, [pendingCount]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customerPhone)).size;
    const repeatCustomers = orders.reduce((acc, o) => {
      const key = o.customerId || o.customerPhone;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const repeatCount = Object.values(repeatCustomers).filter(c => c > 1).length;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      readyOrders: orders.filter(o => o.status === 'ready').length,
      outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
      deliveredToday: orders.filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === today).length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalRevenue: deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalProducts: products.length,
      lowStock: products.filter(p => !p.inStock).length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      availableDrivers: deliveryPersons?.filter(d => d.isAvailable).length || 0,
      cancelledOrders: cancelledOrders.length,
      cancelledAmount: cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      uniqueCustomers,
      repeatCustomers: repeatCount,
      todayOrderCount: todayOrders.length,
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

  const renderBusinessContent = () => {
    switch (activeBusinessTab) {
      case 'Sales':
        return (
          <View style={styles.businessContentRow}>
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Sales</Text>
              <Text style={styles.businessStatValue}>{'\u20B9'}{stats.totalRevenue.toLocaleString('en-IN')}</Text>
              <Text style={styles.businessStatSub}>{stats.totalOrders} Orders</Text>
            </View>
            <View style={styles.businessStatDivider} />
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Cancellations</Text>
              <Text style={[styles.businessStatValue, { fontSize: 22 }]}>{'\u20B9'}{stats.cancelledAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.businessStatSub}>{stats.cancelledOrders} Orders</Text>
            </View>
          </View>
        );
      case 'Feedback':
        const totalRatings = reviews.length + orderRatings.length;
        const avgRating = totalRatings > 0
          ? ((reviews.reduce((s, r) => s + r.rating, 0) + orderRatings.reduce((s, r) => s + r.overallRating, 0)) / totalRatings).toFixed(1)
          : '0.0';
        return (
          <View style={styles.businessContentRow}>
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Reviews</Text>
              <Text style={styles.businessStatValue}>{totalRatings}</Text>
              <Text style={styles.businessStatSub}>Total ratings</Text>
            </View>
            <View style={styles.businessStatDivider} />
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Avg Rating</Text>
              <Text style={styles.businessStatValue}>{avgRating}</Text>
              <Text style={styles.businessStatSub}>Overall</Text>
            </View>
          </View>
        );
      case 'Customers':
        return (
          <View style={styles.businessContentRow}>
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Total</Text>
              <Text style={styles.businessStatValue}>{stats.uniqueCustomers}</Text>
              <Text style={styles.businessStatSub}>Unique customers</Text>
            </View>
            <View style={styles.businessStatDivider} />
            <View style={styles.businessStat}>
              <Text style={styles.businessStatLabel}>Repeat</Text>
              <Text style={styles.businessStatValue}>{stats.repeatCustomers}</Text>
              <Text style={styles.businessStatSub}>Returning customers</Text>
            </View>
          </View>
        );
    }
  };

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
        {/* ── Warm Gradient Header ── */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Top bar */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setSidebarVisible(true)}>
              <Icon name="menu" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <Text style={styles.shopName}>{owner?.name || 'My Shop'}</Text>
              <View style={styles.outletInfoRow}>
                <Text style={styles.outletInfoText}>
                  {stats.totalProducts} Products  |  {stats.activeSubscriptions} Subs  |  </Text>
                <Text style={[styles.outletInfoText, { color: stats.availableDrivers > 0 ? '#C8FFD4' : '#FFD4D4' }]}>
                  {stats.availableDrivers} Online
                </Text>
                <Icon name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/notifications' as any)}>
                <Icon name="bell-outline" size={22} color="#FFF" />
                {stats.pendingOrders > 0 && (
                  <View style={styles.notifDot}>
                    <Text style={styles.notifDotText}>{stats.pendingOrders}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/settings' as any)}>
                <Icon name="cog-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Business Card (floats over gradient) ── */}
        <View style={styles.businessCardWrap}>
          <View style={[styles.businessCard, themed.card]}>
            <View style={styles.businessCardHeader}>
              <View>
                <Text style={[styles.businessTitle, themed.textPrimary]}>Business</Text>
                <Text style={styles.businessSubtitle}>All Orders</Text>
              </View>
              <TouchableOpacity style={styles.todayBtn} onPress={() => router.push('/order-calendar' as any)}>
                <Text style={styles.todayBtnText}>TODAY</Text>
                <Icon name="calendar" size={16} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.businessTabs}>
              {(['Sales', 'Feedback', 'Customers'] as BusinessTab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.businessTab, activeBusinessTab === tab && styles.businessTabActive]}
                  onPress={() => setActiveBusinessTab(tab)}
                >
                  <Text style={[styles.businessTabText, activeBusinessTab === tab && styles.businessTabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {renderBusinessContent()}

            {/* CTA */}
            <TouchableOpacity style={styles.businessDetailsCta} onPress={() => router.push('/sales-report' as any)}>
              <Text style={styles.businessDetailsCtaText}>See business details</Text>
              <View style={styles.ctaArrow}>
                <Icon name="arrow-right" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Order Status Cards ── */}
        <View style={styles.orderStatusSection}>
          <View style={styles.orderStatusRow}>
            {[
              { count: stats.pendingOrders, label: 'Pending', status: 'pending', icon: 'clock-outline', color: '#E65100', bg: '#FFF3E0' },
              { count: stats.preparingOrders, label: 'Preparing', status: 'preparing', icon: 'food-variant', color: '#1565C0', bg: '#E3F2FD' },
              { count: stats.readyOrders, label: 'Ready', status: 'ready', icon: 'check-circle-outline', color: '#388E3C', bg: '#E8F5E9' },
              { count: stats.outForDelivery, label: 'In Transit', status: 'out_for_delivery', icon: 'truck-delivery-outline', color: '#7B1FA2', bg: '#F3E5F5' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.orderStatusPill, { backgroundColor: item.bg }]}
                onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: item.status } } as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.orderStatusIconWrap, { backgroundColor: item.color + '18' }]}>
                  <Icon name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={[styles.orderStatusCount, { color: item.color }]}>{item.count}</Text>
                <Text style={[styles.orderStatusLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Today's Revenue Card ── */}
        {/* <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <LinearGradient
              colors={['#1B5E20', '#2E7D32', '#43A047']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revenueGradient}
            >
              <View style={styles.revenueRow}>
                <View style={styles.revenueCol}>
                  <View style={styles.revenueLabelRow}>
                    <Icon name="chart-line" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.revenueLabel}>Today's Sales</Text>
                  </View>
                  <Text style={styles.revenueAmount}>{'\u20B9'}{stats.todayRevenue.toLocaleString('en-IN')}</Text>
                  <Text style={styles.revenueSubtext}>{stats.todayOrderCount} orders today</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueCol}>
                  <View style={styles.revenueLabelRow}>
                    <Icon name="finance" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                  </View>
                  <Text style={styles.revenueAmount}>{'\u20B9'}{stats.totalRevenue.toLocaleString('en-IN')}</Text>
                  <Text style={styles.revenueSubtext}>{stats.deliveredToday} delivered today</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View> */}

        {/* ── Recent Orders ── */}
        <View style={styles.cardSection}>
          <View style={[styles.card, themed.card]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, themed.textPrimary]}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders' as any)} style={styles.seeAllLink}>
                <Text style={styles.seeAllLinkText}>See All</Text>
                <Icon name="chevron-right" size={16} color="#FF6B35" />
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
                        <Text style={[styles.orderTotal, { color: '#FF6B35' }]}>{'\u20B9'}{order.total}</Text>
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

      <SidebarDrawer visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 20 },

  /* ── Header Gradient ── */
  headerGradient: {
    paddingTop: SPACING.md, paddingBottom: 60,
    paddingHorizontal: SPACING.lg,
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: SPACING.md,
  },
  headerLeft: { flex: 1 },
  shopName: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  outletInfoRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 4,
  },
  outletInfoText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  headerIconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3, borderWidth: 2, borderColor: '#FF6B35',
  },
  notifDotText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  /* ── Business Card ── */
  businessCardWrap: {
    paddingHorizontal: SPACING.base, marginTop: -44,
  },
  businessCard: {
    borderRadius: RADIUS.xl + 4, overflow: 'hidden',
    ...SHADOW.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  businessCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg,
  },
  businessTitle: { fontSize: 20, fontWeight: '800' },
  businessSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  todayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  todayBtnText: { fontSize: 13, fontWeight: '800', color: '#FF6B35' },

  /* ── Business Tabs ── */
  businessTabs: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, marginTop: SPACING.base,
  },
  businessTab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.full, backgroundColor: '#F5F5F5',
  },
  businessTabActive: {
    backgroundColor: '#FF6B35',
  },
  businessTabText: {
    fontSize: 13, fontWeight: '600', color: '#666',
  },
  businessTabTextActive: {
    color: '#FFF',
  },

  /* ── Business Content ── */
  businessContentRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  businessStat: { flex: 1 },
  businessStatLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  businessStatValue: { fontSize: 26, fontWeight: '800', color: '#222', marginTop: 4, letterSpacing: -0.5 },
  businessStatSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  businessStatDivider: { width: 1, backgroundColor: '#EEE', marginHorizontal: SPACING.md },

  /* ── Business Details CTA ── */
  businessDetailsCta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#222', marginHorizontal: SPACING.base,
    marginTop: SPACING.lg, marginBottom: SPACING.base,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  businessDetailsCtaText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  ctaArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Order Status Row ── */
  orderStatusSection: {
    paddingHorizontal: SPACING.base, marginTop: SPACING.lg,
  },
  orderStatusRow: {
    flexDirection: 'row', gap: SPACING.sm,
  },
  orderStatusPill: {
    flex: 1, alignItems: 'center',
    borderRadius: RADIUS.lg + 2,
    paddingVertical: SPACING.md + 2,
    ...SHADOW.sm,
  },
  orderStatusIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  orderStatusCount: { fontSize: 22, fontWeight: '800' },
  orderStatusLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* ── Card Sections ── */
  cardSection: { paddingHorizontal: SPACING.base, marginTop: SPACING.base },
  card: {
    borderRadius: RADIUS.xl + 4, padding: SPACING.lg,
    ...SHADOW.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.base,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  /* ── See All Link ── */
  seeAllLink: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  seeAllLinkText: { fontSize: 13, fontWeight: '700', color: '#FF6B35' },

  /* ── Revenue Card ── */
  revenueGradient: { padding: SPACING.lg, paddingVertical: SPACING.xl, borderRadius: RADIUS.xl },
  revenueRow: { flexDirection: 'row', alignItems: 'center' },
  revenueCol: { flex: 1 },
  revenueLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  revenueLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },
  revenueAmount: { fontSize: 26, fontWeight: '800', color: '#FFF', marginTop: 6, letterSpacing: -1 },
  revenueSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '500' },
  revenueDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: SPACING.lg },

  /* ── Recent Orders ── */
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md + 2,
  },
  orderRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  orderIcon: {
    width: 46, height: 46, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  orderInfo: { flex: 1 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  orderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  orderCustomer: { fontSize: 13, color: COLORS.text.secondary, marginTop: 3, fontWeight: '500' },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  orderTimePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  orderTime: { fontSize: 11, color: COLORS.text.muted },
  orderTotal: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  /* ── Empty ── */
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: 14, color: COLORS.text.muted, marginTop: SPACING.md, fontWeight: '500' },
});
