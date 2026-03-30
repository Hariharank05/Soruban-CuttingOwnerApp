// app/customer-analytics.tsx - Customer Spending Analytics
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import type { Order } from '@/types';

interface CustomerSummary {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

const RANK_COLORS: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

function formatCurrency(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function CustomerAnalyticsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();

  const customerMap = useMemo(() => {
    const map: Record<string, CustomerSummary> = {};
    orders.forEach((o: Order) => {
      if (!map[o.customerId]) {
        map[o.customerId] = { id: o.customerId, name: o.customerName, totalOrders: 0, totalSpent: 0, avgOrderValue: 0, lastOrderDate: o.createdAt };
      }
      map[o.customerId].totalOrders += 1;
      map[o.customerId].totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(map[o.customerId].lastOrderDate)) {
        map[o.customerId].lastOrderDate = o.createdAt;
      }
    });
    Object.values(map).forEach(c => { c.avgOrderValue = Math.round(c.totalSpent / c.totalOrders); });
    return map;
  }, [orders]);

  const customers = useMemo(() =>
    Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent),
    [customerMap]
  );

  const stats = useMemo(() => {
    const total = customers.length;
    const avgOrderVal = total > 0 ? Math.round(customers.reduce((s, c) => s + c.avgOrderValue, 0) / total) : 0;
    const avgOrdersPerCust = total > 0 ? (customers.reduce((s, c) => s + c.totalOrders, 0) / total).toFixed(1) : '0';
    return { total, avgOrderVal, avgOrdersPerCust, retention: '72%' };
  }, [customers]);

  const segments = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newCust = customers.filter(c => c.totalOrders === 1);
    const regular = customers.filter(c => c.totalOrders >= 3);
    const vip = customers.filter(c => c.totalSpent > 5000);
    const atRisk = customers.filter(c => new Date(c.lastOrderDate) < thirtyDaysAgo);
    const t = customers.length || 1;
    return [
      { key: 'new', name: 'New', icon: 'account-plus' as const, count: newCust.length, pct: Math.round((newCust.length / t) * 100), color: '#1E88E5', bg: '#E3F2FD' },
      { key: 'regular', name: 'Regular', icon: 'account-check' as const, count: regular.length, pct: Math.round((regular.length / t) * 100), color: '#2E7D32', bg: '#E8F5E9' },
      { key: 'vip', name: 'VIP', icon: 'crown' as const, count: vip.length, pct: Math.round((vip.length / t) * 100), color: '#7B1FA2', bg: '#F3E5F5' },
      { key: 'atRisk', name: 'At Risk', icon: 'alert-circle' as const, count: atRisk.length, pct: Math.round((atRisk.length / t) * 100), color: '#E65100', bg: '#FFF3E0' },
    ];
  }, [customers]);

  const frequencyBuckets = useMemo(() => {
    const b = [
      { label: '1 order', min: 1, max: 1, count: 0 },
      { label: '2-5 orders', min: 2, max: 5, count: 0 },
      { label: '6-10 orders', min: 6, max: 10, count: 0 },
      { label: '10+ orders', min: 11, max: 999, count: 0 },
    ];
    customers.forEach(c => {
      const bucket = b.find(bb => c.totalOrders >= bb.min && c.totalOrders <= bb.max);
      if (bucket) bucket.count += 1;
    });
    return b;
  }, [customers]);

  const maxFreq = Math.max(...frequencyBuckets.map(b => b.count), 1);
  const top5 = customers.slice(0, 5);
  const maxSpent = top5.length > 0 ? top5[0].totalSpent : 1;

  const renderCustomerCard = ({ item, index }: { item: CustomerSummary; index: number }) => {
    const rank = index + 1;
    const badgeColor = RANK_COLORS[rank] || '#9E9E9E';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.rankBadge, { backgroundColor: badgeColor + '22', borderColor: badgeColor }]}>
            <Text style={[styles.rankText, { color: badgeColor }]}>#{rank}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.totalOrders} orders | Last: {formatDate(item.lastOrderDate)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.spentValue}>{formatCurrency(item.totalSpent)}</Text>
            <Text style={styles.avgLabel}>Avg: {formatCurrency(item.avgOrderValue)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="account-group-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No customer data</Text>
      <Text style={styles.emptySub}>Customer analytics will appear once you receive orders</Text>
    </View>
  );

  const ListHeader = () => (
    <>
      {/* Segments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Customer Segments</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentsRow}>
        {segments.map(seg => (
          <View key={seg.key} style={[styles.segmentCard, { backgroundColor: seg.bg }]}>
            <Icon name={seg.icon} size={22} color={seg.color} />
            <Text style={[styles.segmentName, { color: seg.color }]}>{seg.name}</Text>
            <Text style={[styles.segmentCount, { color: seg.color }]}>{seg.count}</Text>
            <Text style={styles.segmentPct}>{seg.pct}%</Text>
          </View>
        ))}
      </ScrollView>

      {/* Order Frequency Chart */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order Frequency</Text>
      </View>
      <View style={styles.chartCard}>
        {frequencyBuckets.map(bucket => (
          <View key={bucket.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{bucket.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(bucket.count / maxFreq) * 100}%` }]} />
            </View>
            <Text style={styles.barCount}>{bucket.count}</Text>
          </View>
        ))}
      </View>

      {/* Revenue per Customer */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top 5 Revenue Contributors</Text>
      </View>
      <View style={styles.chartCard}>
        {top5.map((c, i) => (
          <View key={c.id} style={styles.barRow}>
            <Text style={styles.barLabel} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(c.totalSpent / maxSpent) * 100}%`, backgroundColor: RANK_COLORS[i + 1] || COLORS.primary }]} />
            </View>
            <Text style={styles.barCount}>{formatCurrency(c.totalSpent)}</Text>
          </View>
        ))}
      </View>

      {/* Top Customers Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Customers</Text>
        <Text style={styles.sectionCount}>{customers.length} total</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Analytics</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="account-group" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="currency-inr" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{formatCurrency(stats.avgOrderVal)}</Text>
          <Text style={styles.statLabel}>Avg Order</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="cart-outline" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.avgOrdersPerCust}</Text>
          <Text style={styles.statLabel}>Avg Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="heart-pulse" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.retention}</Text>
          <Text style={styles.statLabel}>Retention</Text>
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderCustomerCard}
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

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  sectionCount: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  segmentsRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  segmentCard: { width: 100, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 4 },
  segmentName: { fontSize: 11, fontWeight: '700' },
  segmentCount: { fontSize: 18, fontWeight: '800' },
  segmentPct: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },

  chartCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  barLabel: { width: 70, fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },
  barTrack: { flex: 1, height: 16, backgroundColor: '#F5F5F5', borderRadius: RADIUS.sm, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.sm },
  barCount: { width: 55, fontSize: 11, fontWeight: '700', color: COLORS.text.primary, textAlign: 'right' },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '800' },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  cardSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  spentValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  avgLabel: { fontSize: 10, color: COLORS.text.muted, marginTop: 2 },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
