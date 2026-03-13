import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import customersData from '@/data/customers';
import type { Customer } from '@/types';

export default function CustomersScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');

  const enrichedCustomers = useMemo(() => {
    return customersData.map(customer => {
      const custOrders = orders.filter(o => o.customerId === customer.id);
      const orderTotal = custOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = custOrders.length > 0
        ? custOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;
      return {
        ...customer,
        orderCount: custOrders.length > 0 ? custOrders.length : customer.totalOrders,
        spent: orderTotal > 0 ? orderTotal : customer.totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : customer.lastOrderDate,
      };
    });
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return enrichedCustomers;
    const q = searchQuery.toLowerCase();
    return enrichedCustomers.filter(
      c => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [enrichedCustomers, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const activeCount = enrichedCustomers.filter(c => {
      if (!c.lastOrderDate) return false;
      return new Date(c.lastOrderDate) >= monthAgo;
    }).length;
    return { total: enrichedCustomers.length, active: activeCount };
  }, [enrichedCustomers]);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }, []);

  const renderCustomer = useCallback(({ item }: { item: typeof enrichedCustomers[0] }) => (
    <TouchableOpacity
      style={[styles.customerCard, themed.card]}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/customer-detail', params: { id: item.id } })}
    >
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.custName, themed.textPrimary]}>{item.name}</Text>
          <View style={styles.phoneRow}>
            <Icon name="phone-outline" size={13} color={COLORS.text.muted} />
            <Text style={[styles.phoneText, themed.textSecondary]}>{item.phone}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.text.muted} />
      </View>

      <View style={styles.cardStats}>
        <View style={styles.cardStatItem}>
          <Icon name="receipt" size={14} color={COLORS.primary} />
          <Text style={[styles.cardStatText, themed.textSecondary]}>{item.orderCount} orders</Text>
        </View>
        <View style={styles.cardStatItem}>
          <Icon name="currency-inr" size={14} color="#FFA726" />
          <Text style={[styles.cardStatText, themed.textSecondary]}>{'\u20B9'}{item.spent.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.cardStatItem}>
          <Icon name="clock-outline" size={14} color={COLORS.text.muted} />
          <Text style={[styles.cardStatText, themed.textMuted]}>{formatDate(item.lastOrderDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [themed, router, formatDate]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Customers</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, themed.inputBg]}>
          <Icon name="magnify" size={20} color={COLORS.text.muted} />
          <TextInput
            style={[styles.searchInput, { color: themed.colors.text.primary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or phone..."
            placeholderTextColor={COLORS.text.muted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="account-group" size={22} color={COLORS.primary} />
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="account-check" size={22} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active This Month</Text>
        </View>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-search-outline" size={56} color={COLORS.text.muted} />
            <Text style={[styles.emptyTitle, themed.textPrimary]}>No customers found</Text>
            <Text style={[styles.emptyDesc, themed.textMuted]}>
              {searchQuery ? 'Try a different search term' : 'Customers will appear here'}
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

  searchContainer: { paddingHorizontal: SPACING.base, marginTop: -SPACING.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  statsRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.base, marginTop: SPACING.md, marginBottom: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  listContent: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },

  customerCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.backgroundSoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  custName: { fontSize: 15, fontWeight: '700' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phoneText: { fontSize: 12 },

  cardStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  cardStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: 12, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
