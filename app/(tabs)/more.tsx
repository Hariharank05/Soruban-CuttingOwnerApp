import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useTabBar } from '@/context/TabBarContext';

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { owner, logout } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { subscriptions } = useSubscriptions();
  const { handleScroll } = useTabBar();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0);
    const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customerPhone)).size;

    return {
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalRevenue,
      totalCustomers: uniqueCustomers,
      totalProducts: products.length,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      activeSubs: subscriptions.filter(s => s.status === 'active').length,
    };
  }, [orders, products, subscriptions]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout?.() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} onScroll={handleScroll} scrollEventThrottle={16}>
        {/* ── Profile Header ── */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Icon name="account" size={30} color="#FF6B35" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{owner?.name || 'Business Owner'}</Text>
              <Text style={styles.profileRole}>{owner?.role || 'Owner'}</Text>
              {owner?.phone && (
                <View style={styles.profilePhoneRow}>
                  <Icon name="phone-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.profilePhone}>{owner.phone}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings' as any)}>
              <Icon name="pencil-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="currency-inr" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>
                {stats.todayRevenue > 1000 ? `${(stats.todayRevenue / 1000).toFixed(1)}K` : stats.todayRevenue}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="receipt" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="account-group" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="food-apple" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Business Summary ── */}
        <View style={styles.section}>
          <View style={[styles.summaryCard, themed.card]}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="chart-line" size={22} color="#388E3C" />
                <Text style={[styles.summaryValue, { color: '#388E3C' }]}>
                  {'\u20B9'}{stats.totalRevenue > 1000 ? `${(stats.totalRevenue / 1000).toFixed(1)}K` : stats.totalRevenue}
                </Text>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
              </View>
              <View style={[styles.summaryItem, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="calendar-sync" size={22} color="#1565C0" />
                <Text style={[styles.summaryValue, { color: '#1565C0' }]}>{stats.activeSubs}</Text>
                <Text style={styles.summaryLabel}>Active Subs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Quick Actions</Text>
          <View style={[styles.quickActionsCard, themed.card]}>
            {[
              { icon: 'store', label: 'Shop Profile', color: '#388E3C', bg: '#E8F5E9', route: '/shop-profile' },
              { icon: 'chart-bar', label: 'Sales Report', color: '#1565C0', bg: '#E3F2FD', route: '/sales-report' },
              { icon: 'account-group', label: 'Customers', color: '#7B1FA2', bg: '#F3E5F5', route: '/customers' },
              { icon: 'badge-account', label: 'Staff', color: '#E65100', bg: '#FFF3E0', route: '/staff-manage' },
              { icon: 'wallet', label: 'Payments', color: '#00796B', bg: '#E0F7FA', route: '/payments' },
              { icon: 'star-outline', label: 'Reviews', color: '#FFA000', bg: '#FFF3E0', route: '/reviews-manage' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickActionItem}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: item.bg }]}>
                  <Icon name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.quickActionLabel, themed.textPrimary]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Account & Settings ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Account</Text>
          <View style={[styles.menuCard, themed.card]}>
            {[
              { icon: 'cog-outline', label: 'Settings', desc: 'App preferences & theme', color: '#616161', route: '/settings' },
              { icon: 'bell-cog', label: 'Notification Config', desc: 'Templates & campaigns', color: '#7B1FA2', route: '/notification-config' },
              { icon: 'headset', label: 'Support Tickets', desc: 'Customer support', color: '#C62828', route: '/support-tickets' },
              { icon: 'alert-circle-outline', label: 'Issues', desc: 'Reported problems', color: '#E53935', route: '/issues-manage' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, idx < 3 && styles.menuItemBorder]}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: item.color + '15' }]}>
                  <Icon name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemLabel, themed.textPrimary]}>{item.label}</Text>
                  <Text style={styles.menuItemDesc}>{item.desc}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: themed.colors.card, borderColor: themed.isDark ? 'rgba(229,57,53,0.3)' : '#FFCDD2' }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="logout" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Soruban Retail Solutions</Text>
          <Text style={styles.footerVersion}>Cutting Owner App v{APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },

  /* ── Header Gradient ── */
  headerGradient: {
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  profileAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  profilePhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  profilePhone: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  editBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Stats ── */
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },

  /* ── Sections ── */
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: SPACING.md, letterSpacing: -0.3 },

  /* ── Business Summary ── */
  summaryCard: { borderRadius: RADIUS.xl, padding: SPACING.base, ...SHADOW.sm },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm },
  summaryItem: {
    flex: 1, borderRadius: RADIUS.lg, padding: SPACING.base,
    alignItems: 'center', gap: 6,
  },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.muted },

  /* ── Quick Actions ── */
  quickActionsCard: {
    borderRadius: RADIUS.xl, padding: SPACING.base,
    ...SHADOW.sm, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '30%', alignItems: 'center', marginBottom: SPACING.base,
  },
  quickActionIcon: {
    width: 50, height: 50, borderRadius: RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 11, fontWeight: '600', textAlign: 'center',
    marginTop: 6, lineHeight: 14,
  },

  /* ── Menu Card ── */
  menuCard: { borderRadius: RADIUS.xl, ...SHADOW.sm, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md + 2,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  menuItemIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemContent: { flex: 1 },
  menuItemLabel: { fontSize: 14, fontWeight: '700' },
  menuItemDesc: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },

  /* ── Logout ── */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SPACING.base, marginTop: SPACING.xl,
    paddingVertical: 14, borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#E53935' },

  /* ── Footer ── */
  footer: { alignItems: 'center', marginTop: SPACING.xl, paddingBottom: SPACING.lg },
  footerText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  footerVersion: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
});
