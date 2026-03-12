import React, { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import customers from '@/data/customers';
import type { Order } from '@/types';

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending: { color: '#E65100', bg: '#FFF3E0' },
  preparing: { color: '#1565C0', bg: '#E3F2FD' },
  ready: { color: '#388E3C', bg: '#E8F5E9' },
  out_for_delivery: { color: '#7B1FA2', bg: '#F3E5F5' },
  delivered: { color: '#616161', bg: '#F5F5F5' },
  cancelled: { color: '#C62828', bg: '#FFEBEE' },
};

export default function CustomerDetailScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useOrders();
  const { subscriptions } = useSubscriptions();

  const customer = useMemo(() => customers.find(c => c.id === id), [id]);
  const customerOrders = useMemo(() => orders.filter(o => o.customerId === id), [orders, id]);
  const customerSubscriptions = useMemo(() => subscriptions.filter(s => s.customerId === id), [subscriptions, id]);

  const memberSince = useMemo(() => {
    if (!customer?.joinedDate) return 'N/A';
    return new Date(customer.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }, [customer]);

  const handleCall = useCallback(() => {
    if (customer?.phone) Linking.openURL(`tel:${customer.phone}`);
  }, [customer]);

  const handleEmail = useCallback(() => {
    if (customer?.email) Linking.openURL(`mailto:${customer.email}`);
  }, [customer]);

  const renderOrder = useCallback(({ item }: { item: Order }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const itemsSummary = item.items.slice(0, 2).map(i => i.name).join(', ');
    const moreCount = item.items.length - 2;

    return (
      <TouchableOpacity
        style={[styles.orderCard, themed.card]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/order-detail', params: { id: item.id } })}
      >
        <View style={styles.orderTopRow}>
          <Text style={[styles.orderId, themed.textPrimary]}>#{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>
              {item.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Text>
          </View>
        </View>
        <Text style={[styles.orderDate, themed.textMuted]}>
          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
        <Text style={[styles.orderItems, themed.textSecondary]} numberOfLines={1}>
          {itemsSummary}{moreCount > 0 ? ` +${moreCount} more` : ''}
        </Text>
        <View style={styles.orderBottomRow}>
          <Text style={styles.orderTotal}>{'\u20B9'}{item.total}</Text>
          <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
        </View>
      </TouchableOpacity>
    );
  }, [themed, router]);

  if (!customer) {
    return (
      <SafeAreaView style={[styles.safe, themed.safeArea]}>
        <View style={styles.centered}>
          <Icon name="account-off-outline" size={56} color={COLORS.text.muted} />
          <Text style={[styles.emptyTitle, themed.textPrimary]}>Customer not found</Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={['#388E3C', '#4CAF50']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{customer.name}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={customerOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Customer Info Card */}
            <View style={[styles.card, themed.card]}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Icon name="account" size={36} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.custName, themed.textPrimary]}>{customer.name}</Text>
                  {customer.email && (
                    <Text style={[styles.custEmail, themed.textSecondary]}>{customer.email}</Text>
                  )}
                </View>
              </View>

              <View style={styles.contactRow}>
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                  <Icon name="phone" size={18} color={COLORS.primary} />
                  <Text style={styles.contactBtnText}>{customer.phone}</Text>
                </TouchableOpacity>
                {customer.email && (
                  <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                    <Icon name="email-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.contactBtnText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>

              {customer.address && (
                <View style={styles.addressRow}>
                  <Icon name="map-marker-outline" size={18} color={COLORS.text.muted} />
                  <Text style={[styles.addressText, themed.textSecondary]}>{customer.address}</Text>
                </View>
              )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, themed.card]}>
                <Icon name="receipt" size={22} color={COLORS.primary} />
                <Text style={[styles.statValue, themed.textPrimary]}>{customer.totalOrders}</Text>
                <Text style={[styles.statLabel, themed.textMuted]}>Orders</Text>
              </View>
              <View style={[styles.statCard, themed.card]}>
                <Icon name="currency-inr" size={22} color="#FFA726" />
                <Text style={[styles.statValue, themed.textPrimary]}>{'\u20B9'}{customer.totalSpent.toLocaleString('en-IN')}</Text>
                <Text style={[styles.statLabel, themed.textMuted]}>Total Spent</Text>
              </View>
              <View style={[styles.statCard, themed.card]}>
                <Icon name="calendar-check" size={22} color="#1E88E5" />
                <Text style={[styles.statValue, themed.textPrimary]}>{memberSince}</Text>
                <Text style={[styles.statLabel, themed.textMuted]}>Member Since</Text>
              </View>
            </View>

            {/* Active Subscriptions */}
            {customerSubscriptions.length > 0 && (
              <View style={[styles.card, themed.card]}>
                <Text style={[styles.sectionTitle, themed.textPrimary]}>Subscriptions</Text>
                {customerSubscriptions.map(sub => {
                  const isActive = sub.status === 'active';
                  return (
                    <View key={sub.id} style={styles.subCard}>
                      <View style={styles.subHeader}>
                        <View style={[styles.subStatusBadge, { backgroundColor: isActive ? '#E8F5E9' : sub.status === 'paused' ? '#FFF3E0' : '#FFEBEE' }]}>
                          <Text style={[styles.subStatusText, { color: isActive ? '#388E3C' : sub.status === 'paused' ? '#E65100' : '#C62828' }]}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </Text>
                        </View>
                        <Text style={[styles.subFreq, themed.textSecondary]}>
                          {sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)} | {sub.preferredTime}
                        </Text>
                      </View>
                      <Text style={[styles.subItems, themed.textSecondary]} numberOfLines={1}>
                        {sub.items.map(i => i.name).join(', ')}
                      </Text>
                      <Text style={styles.subAmount}>{'\u20B9'}{sub.totalAmount}/delivery</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Order History Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, themed.textPrimary, { marginBottom: 0 }]}>Order History</Text>
              <Text style={[styles.orderCount, themed.textMuted]}>{customerOrders.length} orders</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="clipboard-text-outline" size={40} color={COLORS.text.muted} />
            <Text style={[styles.emptyTitle, themed.textMuted]}>No orders yet</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  listContent: { padding: SPACING.base },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.backgroundSoft, justifyContent: 'center', alignItems: 'center' },
  custName: { fontSize: 18, fontWeight: '800' },
  custEmail: { fontSize: 13, marginTop: 2 },

  contactRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.backgroundSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  addressRow: { flexDirection: 'row', gap: 8, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  addressText: { fontSize: 13, flex: 1 },

  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  orderCount: { fontSize: 13, fontWeight: '600' },

  subCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  subStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  subStatusText: { fontSize: 11, fontWeight: '700' },
  subFreq: { fontSize: 12 },
  subItems: { fontSize: 12, color: COLORS.text.secondary, marginBottom: 4 },
  subAmount: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  orderCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 14, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 12, marginBottom: 6 },
  orderItems: { fontSize: 13, marginBottom: SPACING.sm },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  orderTotal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },

  emptyBox: { alignItems: 'center', paddingTop: SPACING.xxl },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: SPACING.md },
  goBackBtn: { marginTop: SPACING.base, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary },
  goBackText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
