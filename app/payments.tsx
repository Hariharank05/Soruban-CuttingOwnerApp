import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import type { Payment, PaymentMethod } from '@/types';

const FILTER_TABS: { key: Payment['status'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'refunded', label: 'Refunded' },
];

const getMethodConfig = (themed: any): Record<PaymentMethod, { color: string; bg: string; icon: string; label: string }> => ({
  cod: { color: '#E65100', bg: themed.colors.accentBg.orange, icon: 'cash', label: 'COD' },
  upi: { color: '#1565C0', bg: themed.colors.accentBg.blue, icon: 'cellphone', label: 'UPI' },
  wallet: { color: '#7B1FA2', bg: themed.colors.accentBg.purple, icon: 'wallet', label: 'Wallet' },
  wallet_partial: { color: '#7B1FA2', bg: themed.colors.accentBg.purple, icon: 'wallet-outline', label: 'Wallet+' },
});

const getStatusConfig = (themed: any): Record<string, { color: string; bg: string }> => ({
  completed: { color: '#388E3C', bg: themed.colors.accentBg.green },
  pending: { color: '#E65100', bg: themed.colors.accentBg.orange },
  refunded: { color: '#1565C0', bg: themed.colors.accentBg.blue },
  failed: { color: '#C62828', bg: themed.colors.accentBg.red },
});

export default function PaymentsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const [activeFilter, setActiveFilter] = useState<Payment['status'] | 'all'>('all');
  const METHOD_CONFIG = useMemo(() => getMethodConfig(themed), [themed]);
  const STATUS_CONFIG = useMemo(() => getStatusConfig(themed), [themed]);

  // Generate payment records from orders
  const payments: Payment[] = useMemo(() => {
    return orders.map(order => {
      let status: Payment['status'] = 'completed';
      if (order.status === 'pending') status = 'pending';
      if (order.status === 'cancelled') status = 'refunded';

      return {
        id: `pay_${order.id}`,
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        method: order.paymentMethod,
        amount: order.total,
        status,
        date: order.createdAt,
        walletAmountUsed: order.walletAmountUsed,
      };
    });
  }, [orders]);

  const summary = useMemo(() => {
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    const pendingCod = payments.filter(p => p.status === 'pending' && p.method === 'cod').reduce((s, p) => s + p.amount, 0);
    const walletRefunds = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
    const onlinePayments = payments.filter(p => p.method === 'upi' && p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    return { totalRevenue, pendingCod, walletRefunds, onlinePayments };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'all') return payments;
    return payments.filter(p => p.status === activeFilter);
  }, [payments, activeFilter]);

  const renderPayment = useCallback(({ item }: { item: Payment }) => {
    const methodCfg = METHOD_CONFIG[item.method] || METHOD_CONFIG.cod;
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        style={[styles.paymentCard, themed.card]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/order-detail', params: { id: item.orderId } })}
      >
        <View style={styles.payCardTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.payIdRow}>
              <Icon name="receipt" size={14} color={COLORS.primary} />
              <Text style={[styles.payOrderId, themed.textPrimary]}>#{item.orderId}</Text>
            </View>
            <Text style={[styles.payCustName, themed.textSecondary]}>{item.customerName}</Text>
          </View>
          <Text style={[styles.payAmount, themed.textPrimary]}>{'\u20B9'}{item.amount}</Text>
        </View>

        <View style={styles.payCardBottom}>
          <View style={[styles.methodBadge, { backgroundColor: methodCfg.bg }]}>
            <Icon name={methodCfg.icon as any} size={14} color={methodCfg.color} />
            <Text style={[styles.methodText, { color: methodCfg.color }]}>{methodCfg.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={[styles.payDate, themed.textMuted]}>
            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [themed, router, METHOD_CONFIG, STATUS_CONFIG]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Payments</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={filteredPayments}
        keyExtractor={item => item.id}
        renderItem={renderPayment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: themed.colors.accentBg.green }]}>
                <Icon name="cash-check" size={24} color="#388E3C" />
                <Text style={[styles.summaryValue, { color: '#388E3C' }]}>{'\u20B9'}{summary.totalRevenue.toLocaleString('en-IN')}</Text>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: themed.colors.accentBg.orange }]}>
                <Icon name="cash-clock" size={24} color="#E65100" />
                <Text style={[styles.summaryValue, { color: '#E65100' }]}>{'\u20B9'}{summary.pendingCod.toLocaleString('en-IN')}</Text>
                <Text style={styles.summaryLabel}>Pending COD</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: themed.colors.accentBg.blue }]}>
                <Icon name="cash-refund" size={24} color="#1565C0" />
                <Text style={[styles.summaryValue, { color: '#1565C0' }]}>{'\u20B9'}{summary.walletRefunds.toLocaleString('en-IN')}</Text>
                <Text style={styles.summaryLabel}>Refunds</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: themed.colors.accentBg.purple }]}>
                <Icon name="credit-card-check" size={24} color="#7B1FA2" />
                <Text style={[styles.summaryValue, { color: '#7B1FA2' }]}>{'\u20B9'}{summary.onlinePayments.toLocaleString('en-IN')}</Text>
                <Text style={styles.summaryLabel}>Online</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {FILTER_TABS.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterChip, activeFilter === tab.key && styles.filterChipActive]}
                  onPress={() => setActiveFilter(tab.key)}
                >
                  <Text style={[styles.filterChipText, activeFilter === tab.key && styles.filterChipTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Count */}
            <Text style={[styles.resultCount, themed.textMuted]}>
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="credit-card-off-outline" size={56} color={COLORS.text.muted} />
            <Text style={[styles.emptyTitle, themed.textPrimary]}>No payments found</Text>
            <Text style={[styles.emptyDesc, themed.textMuted]}>
              {activeFilter !== 'all' ? `No ${activeFilter} payments` : 'Payment records will appear here'}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  listContent: { paddingHorizontal: SPACING.base },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm, marginBottom: SPACING.md },
  summaryCard: { width: '48%', flexGrow: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filterChip: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  filterChipTextActive: { color: COLORS.primary },

  resultCount: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },

  paymentCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  payCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  payIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payOrderId: { fontSize: 14, fontWeight: '800' },
  payCustName: { fontSize: 12, marginTop: 2 },
  payAmount: { fontSize: 18, fontWeight: '800' },

  payCardBottom: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  methodBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  methodText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  payDate: { fontSize: 11, marginLeft: 'auto' },

  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
