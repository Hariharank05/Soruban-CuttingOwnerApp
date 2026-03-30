import React, { useMemo } from 'react';
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
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';
import { useSubscriptions } from '@/context/SubscriptionContext';

type NotificationType = 'order' | 'stock' | 'subscription' | 'delivery';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
  route?: string;
  params?: Record<string, string>;
}

const getTypeConfig = (themed: any): Record<NotificationType, { icon: string; color: string; bg: string }> => ({
  order: { icon: 'clipboard-list', color: '#E65100', bg: themed.colors.accentBg.orange },
  stock: { icon: 'alert-circle-outline', color: '#C62828', bg: themed.colors.accentBg.red },
  subscription: { icon: 'calendar-sync', color: '#1565C0', bg: themed.colors.accentBg.blue },
  delivery: { icon: 'truck-delivery-outline', color: '#7B1FA2', bg: themed.colors.accentBg.purple },
});

export default function NotificationsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { subscriptions } = useSubscriptions();
  const TYPE_CONFIG = useMemo(() => getTypeConfig(themed), [themed]);

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending');
    pendingOrders.forEach(order => {
      notifs.push({
        id: `notif_order_${order.id}`,
        type: 'order',
        title: 'New Order Pending',
        message: `Order #ORD-${order.id.slice(-4)} from ${order.customerName} — ₹${order.total}`,
        time: formatTime(order.createdAt),
        route: '/order-detail',
        params: { id: order.id },
        ...TYPE_CONFIG.order,
      });
    });

    // Preparing orders
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    preparingOrders.forEach(order => {
      notifs.push({
        id: `notif_prep_${order.id}`,
        type: 'order',
        title: 'Order Being Prepared',
        message: `Order #ORD-${order.id.slice(-4)} is being prepared for ${order.customerName}`,
        time: formatTime(order.createdAt),
        route: '/order-detail',
        params: { id: order.id },
        icon: 'food-variant',
        color: '#1565C0',
        bg: themed.colors.accentBg.blue,
      });
    });

    // Out of stock products
    const outOfStock = products.filter(p => !p.inStock);
    outOfStock.forEach(product => {
      notifs.push({
        id: `notif_stock_${product.id}`,
        type: 'stock',
        title: 'Out of Stock',
        message: `${product.name} is currently out of stock`,
        time: product.updatedAt ? formatTime(product.updatedAt) : 'Recently',
        route: '/product-form',
        params: { id: product.id },
        ...TYPE_CONFIG.stock,
      });
    });

    // Active subscriptions due today
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    activeSubscriptions.forEach(sub => {
      notifs.push({
        id: `notif_sub_${sub.id}`,
        type: 'subscription',
        title: 'Active Subscription',
        message: `${sub.customerName} — ${sub.frequency} delivery (₹${sub.totalAmount})`,
        time: sub.preferredTime || 'Scheduled',
        route: '/subscription-detail',
        params: { id: sub.id },
        ...TYPE_CONFIG.subscription,
      });
    });

    // Out for delivery
    const inTransit = orders.filter(o => o.status === 'out_for_delivery');
    inTransit.forEach(order => {
      notifs.push({
        id: `notif_del_${order.id}`,
        type: 'delivery',
        title: 'Out for Delivery',
        message: `Order #ORD-${order.id.slice(-4)} is on its way to ${order.customerName}`,
        time: formatTime(order.createdAt),
        route: '/order-detail',
        params: { id: order.id },
        ...TYPE_CONFIG.delivery,
      });
    });

    return notifs;
  }, [orders, products, subscriptions, TYPE_CONFIG, themed]);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notifCard, themed.card]}
      activeOpacity={0.85}
      onPress={() => {
        if (item.route) {
          router.push({ pathname: item.route, params: item.params } as any);
        }
      }}
    >
      <View style={[styles.notifIconWrap, { backgroundColor: item.bg }]}>
        <Icon name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#E8F5E9', zIndex: 10 }} />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Notifications</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{notifications.length}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-off-outline" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyDesc}>No notifications right now</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  countBadge: {
    minWidth: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8,
  },
  countBadgeText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  list: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: 100 },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  notifIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  notifMessage: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2, lineHeight: 17 },
  notifTime: { fontSize: 11, color: COLORS.text.muted, marginTop: 4 },

  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: 4 },
});
