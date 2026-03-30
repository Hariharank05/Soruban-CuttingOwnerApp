import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';

type TimeRange = 'today' | 'week' | 'month' | 'all';

const TIME_TABS: { key: TimeRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface ProductStat {
  productId: string;
  name: string;
  image?: string;
  category?: string;
  totalOrdered: number;
  totalRevenue: number;
  orderCount: number;
  unit: string;
  inStock: boolean;
  topCutType?: string;
}

export default function PopularProductsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const { products } = useProducts();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Build product image/stock lookup
  const productLookup = useMemo(() => {
    const map: Record<string, { image?: string; category?: string; inStock: boolean }> = {};
    for (const p of products) {
      map[p.name.toLowerCase()] = { image: p.image, category: p.category, inStock: p.inStock !== false };
    }
    return map;
  }, [products]);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (o.status === 'cancelled') return false;
      if (timeRange === 'all') return true;
      const orderDate = new Date(o.createdAt);
      if (timeRange === 'today') return orderDate.toDateString() === now.toDateString();
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (timeRange === 'month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, timeRange]);

  // Aggregate product stats
  const productStats = useMemo(() => {
    const map: Record<string, { totalQty: number; revenue: number; orderIds: Set<string>; unit: string; cuts: Record<string, number> }> = {};

    for (const order of filteredOrders) {
      for (const item of order.items) {
        const key = item.name;
        if (!map[key]) {
          map[key] = { totalQty: 0, revenue: 0, orderIds: new Set(), unit: item.unit || 'kg', cuts: {} };
        }
        map[key].totalQty += item.quantity;
        map[key].revenue += item.price * item.quantity;
        map[key].orderIds.add(order.id);
        if (item.cutType) {
          map[key].cuts[item.cutType] = (map[key].cuts[item.cutType] || 0) + item.quantity;
        }
      }
    }

    const stats: ProductStat[] = Object.entries(map).map(([name, data]) => {
      const lookup = productLookup[name.toLowerCase()];
      const topCut = Object.entries(data.cuts).sort((a, b) => b[1] - a[1])[0];
      return {
        productId: name,
        name,
        image: lookup?.image,
        category: lookup?.category,
        totalOrdered: data.totalQty,
        totalRevenue: data.revenue,
        orderCount: data.orderIds.size,
        unit: data.unit,
        inStock: lookup?.inStock ?? true,
        topCutType: topCut ? topCut[0].replace(/_/g, ' ') : undefined,
      };
    });

    stats.sort((a, b) => b.totalOrdered - a.totalOrdered);
    return stats;
  }, [filteredOrders, productLookup]);

  // Summary stats
  const summary = useMemo(() => ({
    totalProducts: productStats.length,
    totalItemsSold: productStats.reduce((s, p) => s + p.totalOrdered, 0),
    totalRevenue: productStats.reduce((s, p) => s + p.totalRevenue, 0),
    topProduct: productStats[0]?.name || '—',
  }), [productStats]);

  const renderProductCard = ({ item, index }: { item: ProductStat; index: number }) => {
    const rank = index + 1;
    const maxQty = productStats[0]?.totalOrdered || 1;
    const barWidth = Math.max((item.totalOrdered / maxQty) * 100, 8);

    return (
      <View style={[styles.card, themed.card]}>
        <View style={styles.cardRow}>
          {/* Rank */}
          <View style={[styles.rankWrap, rank <= 3 && { backgroundColor: MEDAL_COLORS[rank - 1] + '20' }]}>
            {rank <= 3 ? (
              <Icon name="medal" size={18} color={MEDAL_COLORS[rank - 1]} />
            ) : (
              <Text style={styles.rankText}>#{rank}</Text>
            )}
          </View>

          {/* Product Image */}
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Icon name="food-apple-outline" size={20} color={COLORS.text.muted} />
            </View>
          )}

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.productName, themed.textPrimary]} numberOfLines={1}>{item.name}</Text>
              {!item.inStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>Out</Text>
                </View>
              )}
            </View>

            {item.category && (
              <Text style={styles.categoryText}>{item.category}</Text>
            )}

            {/* Bar */}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${barWidth}%` }]} />
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Icon name="package-variant" size={12} color="#E65100" />
                <Text style={styles.metricValue}>{item.totalOrdered} {item.unit}</Text>
              </View>
              <View style={styles.metric}>
                <Icon name="cart-outline" size={12} color="#1565C0" />
                <Text style={styles.metricValue}>{item.orderCount} orders</Text>
              </View>
              <View style={styles.metric}>
                <Icon name="currency-inr" size={12} color="#388E3C" />
                <Text style={[styles.metricValue, { color: '#388E3C', fontWeight: '800' }]}>
                  {'\u20B9'}{item.totalRevenue.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {item.topCutType && (
              <View style={styles.cutBadge}>
                <Icon name="knife" size={10} color="#7B1FA2" />
                <Text style={styles.cutBadgeText}>Top cut: {item.topCutType}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="food-apple" size={20} color="#388E3C" />
          <Text style={[styles.statValue, { color: '#388E3C' }]}>{summary.totalProducts}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="package-variant" size={20} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{summary.totalItemsSold}</Text>
          <Text style={styles.statLabel}>Items Sold</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="currency-inr" size={20} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>
            {summary.totalRevenue > 1000 ? `${(summary.totalRevenue / 1000).toFixed(1)}K` : summary.totalRevenue}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Top Product Highlight */}
      {productStats.length > 0 && (
        <View style={[styles.topHighlight, themed.card]}>
          <Icon name="trophy" size={22} color="#FFD700" />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.topHighlightLabel}>Most Popular</Text>
            <Text style={[styles.topHighlightName, themed.textPrimary]}>{summary.topProduct}</Text>
          </View>
          <Text style={styles.topHighlightQty}>
            {productStats[0]?.totalOrdered} {productStats[0]?.unit}
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, themed.textPrimary]}>All Products by Popularity</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Popular Products</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Time Range Tabs */}
      <View style={styles.timeTabs}>
        {TIME_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.timeTab, timeRange === tab.key && styles.timeTabActive]}
            onPress={() => setTimeRange(tab.key)}
          >
            <Text style={[styles.timeTabText, timeRange === tab.key && styles.timeTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={productStats}
        keyExtractor={(item) => item.productId}
        renderItem={renderProductCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="chart-line" size={56} color={COLORS.text.muted} />
            <Text style={[styles.emptyTitle, themed.textPrimary]}>No sales data yet</Text>
            <Text style={styles.emptyDesc}>Product popularity will show here as orders come in</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  /* Time Tabs */
  timeTabs: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.xs },
  timeTab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: '#F5F5F5',
  },
  timeTabActive: { backgroundColor: COLORS.primary },
  timeTabText: { fontSize: 12, fontWeight: '700', color: COLORS.text.muted },
  timeTabTextActive: { color: '#FFF' },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },

  /* Top Highlight */
  topHighlight: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.base, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, ...SHADOW.sm,
  },
  topHighlightLabel: { fontSize: 11, color: COLORS.text.muted, fontWeight: '600' },
  topHighlightName: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  topHighlightQty: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },

  /* Product Card */
  card: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardRow: { flexDirection: 'row', gap: SPACING.sm },

  rankWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start', marginTop: 2,
  },
  rankText: { fontSize: 12, fontWeight: '800', color: COLORS.text.muted },

  productImage: { width: 52, height: 52, borderRadius: RADIUS.md },
  productImagePlaceholder: { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },

  productInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  productName: { fontSize: 14, fontWeight: '700', flex: 1 },
  categoryText: { fontSize: 10, color: COLORS.text.muted, fontWeight: '600', marginTop: 1 },

  outOfStockBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.full },
  outOfStockText: { fontSize: 9, fontWeight: '700', color: '#C62828' },

  /* Bar */
  barTrack: { height: 6, borderRadius: 3, backgroundColor: '#F0F0F0', marginTop: SPACING.xs, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.primary },

  /* Metrics */
  metricsRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricValue: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },

  /* Cut Badge */
  cutBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F3E5F5', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: RADIUS.full, alignSelf: 'flex-start', marginTop: SPACING.xs,
  },
  cutBadgeText: { fontSize: 9, fontWeight: '700', color: '#7B1FA2' },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', paddingHorizontal: SPACING.xxl },
});
