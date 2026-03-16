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
import { useTabBar } from '@/context/TabBarContext';

const APP_VERSION = '1.0.0';

type MenuItem = {
  icon: string;
  label: string;
  route: string | null;
  color: string;
  bgKey: 'purple' | 'red' | 'orange' | 'blue' | 'green' | 'gray' | 'cyan';
  subtitle?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { icon: 'package-variant', label: 'Packs', route: '/packs', color: '#7B1FA2', bgKey: 'purple', subtitle: 'Dish, Salad & Fruit packs' },
  { icon: 'ticket-percent-outline', label: 'Coupons', route: '/coupons', color: '#C62828', bgKey: 'red', subtitle: 'Offers & discount codes' },
  { icon: 'sale', label: 'Offers', route: '/offers', color: '#E65100', bgKey: 'orange', subtitle: 'Customer view of active offers' },
  { icon: 'calendar-sync', label: 'Subscriptions', route: '/(tabs)/subscriptions', color: '#E65100', bgKey: 'orange', subtitle: 'Weekly & monthly plans' },
  { icon: 'account-group', label: 'Customers', route: '/customers', color: '#1565C0', bgKey: 'blue', subtitle: 'View all customers' },
  { icon: 'wallet', label: 'Payments', route: '/payments', color: '#388E3C', bgKey: 'green', subtitle: 'Payment history & invoices' },
  { icon: 'chart-bar', label: 'Sales Report', route: '/sales-report', color: '#1565C0', bgKey: 'blue', subtitle: 'Revenue & order analytics' },
  { icon: 'store', label: 'Shop Profile', route: '/shop-profile', color: '#388E3C', bgKey: 'green', subtitle: 'Shop details & hours' },
  { icon: 'gift-outline', label: 'Loyalty Program', route: '/loyalty', color: '#7B1FA2', bgKey: 'purple', subtitle: 'Customer rewards setup' },
  { icon: 'tag-multiple', label: 'Promotions', route: '/promotions', color: '#E65100', bgKey: 'orange', subtitle: 'Manage active promotions' },
  { icon: 'bank-transfer', label: 'Settlements', route: '/settlements', color: '#00796B', bgKey: 'cyan', subtitle: 'Payment settlement history' },
  { icon: 'badge-account', label: 'Staff', route: '/staff-manage', color: '#1565C0', bgKey: 'blue', subtitle: 'Manage staff & permissions' },
  { icon: 'tag-edit', label: 'Quick Price Update', route: '/price-update', color: '#C62828', bgKey: 'red', subtitle: 'Bulk update product prices' },
  { icon: 'cog', label: 'Settings', route: '/settings', color: '#616161', bgKey: 'gray', subtitle: 'App preferences & config' },
  { icon: 'information', label: 'About', route: null, color: '#0277BD', bgKey: 'cyan', subtitle: `Version ${APP_VERSION}` },
];

export default function MoreScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { owner, logout } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { handleScroll } = useTabBar();

  const quickStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today;
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customerPhone)).size;

    return {
      todayRevenue,
      totalCustomers: uniqueCustomers,
      totalProducts: products.length,
      todayOrders: todayOrders.length,
    };
  }, [orders, products]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout?.(),
        },
      ]
    );
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.label === 'About') {
      Alert.alert('Cutting Owner App', `Version ${APP_VERSION}\nSoruban Retail Solutions`);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} onScroll={handleScroll} scrollEventThrottle={16}>
        {/* Owner Header Card */}
        <LinearGradient colors={themed.headerGradient} style={styles.ownerHeader}>
          <View style={styles.ownerRow}>
            <View style={[styles.ownerAvatar, { backgroundColor: themed.colors.card }]}>
              <Icon name="account" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.ownerInfo}>
              <Text style={[styles.ownerName, themed.textPrimary]}>{owner?.name || 'Business Owner'}</Text>
              <Text style={[styles.ownerRole, themed.textSecondary]}>{owner?.role || 'Owner'}</Text>
              {owner?.phone && (
                <View style={styles.ownerPhoneRow}>
                  <Icon name="phone-outline" size={12} color={COLORS.text.muted} />
                  <Text style={styles.ownerPhone}>{owner.phone}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: themed.colors.card }]}
              onPress={() => router.push('/settings' as any)}
            >
              <Icon name="pencil-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsSectionTitle, themed.textPrimary]}>Today's Snapshot</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.green }]}>
              <Icon name="currency-inr" size={20} color="#388E3C" />
              <Text style={[styles.statValue, { color: '#388E3C' }]}>
                {quickStats.todayRevenue > 1000
                  ? `${(quickStats.todayRevenue / 1000).toFixed(1)}K`
                  : quickStats.todayRevenue}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.blue }]}>
              <Icon name="receipt" size={20} color="#1565C0" />
              <Text style={[styles.statValue, { color: '#1565C0' }]}>{quickStats.todayOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.purple }]}>
              <Icon name="account-group" size={20} color="#7B1FA2" />
              <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{quickStats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.orange }]}>
              <Icon name="food-apple" size={20} color="#E65100" />
              <Text style={[styles.statValue, { color: '#E65100' }]}>{quickStats.totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, themed.card, index === MENU_ITEMS.length - 1 && { marginBottom: 0 }]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: themed.colors.accentBg[item.bgKey] }]}>
                <Icon name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuLabel, themed.textPrimary]}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              {item.route ? (
                <Icon name="chevron-right" size={20} color={COLORS.text.muted} />
              ) : (
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>v{APP_VERSION}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: themed.colors.card, borderColor: themed.isDark ? 'rgba(229,57,53,0.3)' : '#FFCDD2' }]} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
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

  /* Owner Header */
  ownerHeader: {
    marginHorizontal: SPACING.base, marginTop: SPACING.md,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
  },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ownerAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  ownerInfo: { flex: 1 },
  ownerName: { fontSize: 20, fontWeight: '800' },
  ownerRole: { fontSize: 13, marginTop: 2 },
  ownerPhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ownerPhone: { fontSize: 12, color: COLORS.text.muted },
  editProfileBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Stats */
  statsSection: { marginTop: SPACING.lg, paddingHorizontal: SPACING.base },
  statsSectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* Menu */
  menuSection: { marginTop: SPACING.lg, paddingHorizontal: SPACING.base },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  menuIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  menuSubtitle: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  versionBadge: {
    backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  versionText: { fontSize: 11, fontWeight: '600', color: COLORS.green },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SPACING.base, marginTop: SPACING.xl,
    paddingVertical: 14, borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#E53935' },

  /* Footer */
  footer: { alignItems: 'center', marginTop: SPACING.xl, paddingBottom: SPACING.lg },
  footerText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  footerVersion: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
});
