import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useOrders } from '@/context/OrderContext';

type DateRange = 'today' | 'week' | 'month';

const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

function isWithinRange(dateStr: string, range: DateRange): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case 'today': return d >= startOfDay;
    case 'week': {
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
      return d >= startOfWeek;
    }
    case 'month': return d >= new Date(now.getFullYear(), now.getMonth(), 1);
    default: return false;
  }
}

function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function SalesReportScreen() {
  const router = useRouter();
  const { orders } = useOrders();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const filteredOrders = useMemo(() =>
    orders.filter(o => isWithinRange(o.createdAt, dateRange)),
    [orders, dateRange]);

  const deliveredOrders = useMemo(() =>
    filteredOrders.filter(o => o.status === 'delivered'),
    [filteredOrders]);

  const totalRevenue = useMemo(() =>
    deliveredOrders.reduce((sum, o) => sum + o.total, 0),
    [deliveredOrders]);

  const avgOrderValue = useMemo(() =>
    deliveredOrders.length === 0 ? 0 : Math.round(totalRevenue / deliveredOrders.length),
    [totalRevenue, deliveredOrders]);

  const popularItems = useMemo(() => {
    const itemCounts: Record<string, { name: string; count: number }> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!itemCounts[item.id]) itemCounts[item.id] = { name: item.name, count: 0 };
        itemCounts[item.id].count += item.quantity;
      });
    });
    return Object.entries(itemCounts)
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  const last7DaysRevenue = useMemo(() => {
    const days: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayRevenue = orders
        .filter(o => {
          const d = new Date(o.createdAt);
          return d >= dayStart && d < dayEnd && o.status === 'delivered';
        })
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label: getDayLabel(i), revenue: dayRevenue });
    }
    return days;
  }, [orders]);

  const maxRevenue = useMemo(() =>
    Math.max(...last7DaysRevenue.map(d => d.revenue), 1),
    [last7DaysRevenue]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3']} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sales Report</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Date Range Selector */}
        <View style={styles.dateRangeRow}>
          {DATE_RANGE_OPTIONS.map((option) => {
            const isActive = dateRange === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.dateRangePill, isActive && styles.dateRangePillActive]}
                onPress={() => setDateRange(option.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateRangeText, isActive && styles.dateRangeTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueIconRow}>
            <Icon name="arrow-top-right" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.revenueValue}>{'\u20B9'}{totalRevenue.toLocaleString('en-IN')}</Text>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="shopping-outline" size={24} color="#1565C0" style={styles.statIcon} />
            <Text style={styles.statValue}>{filteredOrders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cash" size={24} color="#00796B" style={styles.statIcon} />
            <Text style={styles.statValue}>{'\u20B9'}{avgOrderValue.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Avg. Order Value</Text>
          </View>
        </View>

        {/* Popular Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          {popularItems.length === 0 ? (
            <Text style={styles.noDataText}>No order data available</Text>
          ) : (
            popularItems.map((item, index) => (
              <View key={item.id} style={styles.popularItemRow}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.popularItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.popularItemCount}>{item.count} ordered</Text>
              </View>
            ))
          )}
        </View>

        {/* Last 7 Days Bar Chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Last 7 Days Revenue</Text>
          <View style={styles.chartContainer}>
            {last7DaysRevenue.map((day, index) => {
              const barHeight = maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0;
              return (
                <View key={`${day.label}-${index}`} style={styles.barColumn}>
                  <Text style={styles.barValue}>
                    {day.revenue > 0 ? `${'\u20B9'}${Math.round(day.revenue / 1000)}k` : ''}
                  </Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, {
                      height: Math.max(barHeight, day.revenue > 0 ? 4 : 0),
                      backgroundColor: day.revenue > 0 ? COLORS.primary : COLORS.border,
                    }]} />
                  </View>
                  <Text style={styles.barLabel}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.xxl },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  dateRangeRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  dateRangePill: { flex: 1, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.xs, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, minHeight: 36 },
  dateRangePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateRangeText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  dateRangeTextActive: { color: '#FFF' },
  revenueCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.xl, marginHorizontal: SPACING.base, marginBottom: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  revenueIconRow: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.backgroundSoft, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  revenueValue: { fontSize: 30, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.xs },
  revenueLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text.muted },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md, marginBottom: SPACING.md },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', ...SHADOW.sm },
  statIcon: { marginBottom: SPACING.sm },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500', color: COLORS.text.muted },
  sectionCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginHorizontal: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  noDataText: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', paddingVertical: SPACING.lg },
  popularItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  rankCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.backgroundSoft, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  rankText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  popularItemName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  popularItemCount: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: SPACING.lg },
  barColumn: { flex: 1, alignItems: 'center' },
  barValue: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted, marginBottom: 4 },
  barWrapper: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '55%', borderTopLeftRadius: 4, borderTopRightRadius: 4, minWidth: 12 },
  barLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted, marginTop: SPACING.xs },
});
