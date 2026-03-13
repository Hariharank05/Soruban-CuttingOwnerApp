import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, Switch,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useCoupons } from '@/context/CouponContext';
import type { Coupon } from '@/types';

export default function CouponsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { coupons, toggleActive } = useCoupons();

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.isActive).length;
    const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    return { total, active, totalUsed };
  }, [coupons]);

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.validTo) < new Date();
  };

  const renderCoupon = ({ item }: { item: Coupon }) => {
    const expired = isExpired(item);
    const usagePercent = item.usageLimit > 0 ? Math.round((item.usedCount / item.usageLimit) * 100) : 0;

    return (
      <TouchableOpacity
        style={[styles.couponCard, themed.card, expired && styles.expiredCard]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/coupon-form', params: { id: item.id } } as any)}
      >
        {/* Coupon header */}
        <View style={styles.couponTopRow}>
          <View style={styles.codeWrap}>
            <Icon name="ticket-percent-outline" size={18} color={item.isActive ? COLORS.primary : COLORS.text.muted} />
            <Text style={[styles.couponCode, !item.isActive && { color: COLORS.text.muted }]}>{item.code}</Text>
          </View>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive?.(item.id)}
            trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
            thumbColor={item.isActive ? '#4CAF50' : '#BDBDBD'}
            style={styles.activeSwitch}
          />
        </View>

        <Text style={styles.couponTitle}>{item.title}</Text>
        <Text style={styles.couponDesc} numberOfLines={2}>{item.description}</Text>

        {/* Discount info */}
        <View style={styles.discountRow}>
          <View style={[styles.discountBadge, {
            backgroundColor: item.discountType === 'percentage' ? '#E3F2FD' : '#E8F5E9',
          }]}>
            <Text style={[styles.discountValue, {
              color: item.discountType === 'percentage' ? '#1565C0' : '#388E3C',
            }]}>
              {item.discountType === 'percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`}
            </Text>
            <Text style={[styles.discountType, {
              color: item.discountType === 'percentage' ? '#1565C0' : '#388E3C',
            }]}>
              {item.discountType === 'percentage' ? 'OFF' : 'FLAT'}
            </Text>
          </View>

          {item.maxDiscount && (
            <Text style={styles.maxDiscountText}>Max: {'\u20B9'}{item.maxDiscount}</Text>
          )}

          <Text style={styles.minOrderText}>Min: {'\u20B9'}{item.minOrderValue}</Text>
        </View>

        {/* Usage & validity */}
        <View style={styles.couponBottomRow}>
          <View style={styles.usageInfo}>
            <View style={styles.usageBar}>
              <View style={[styles.usageFill, { width: `${Math.min(usagePercent, 100)}%` }]} />
            </View>
            <Text style={styles.usageText}>{item.usedCount}/{item.usageLimit} used</Text>
          </View>

          <View style={styles.validityInfo}>
            <Icon name="calendar-range" size={12} color={expired ? '#E53935' : COLORS.text.muted} />
            <Text style={[styles.validityText, expired && { color: '#E53935' }]}>
              {expired ? 'Expired' : `Until ${new Date(item.validTo).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </Text>
          </View>
        </View>

        {item.category && (
          <View style={styles.categoryRow}>
            <Icon name="tag-outline" size={12} color={COLORS.text.muted} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Coupons & Offers</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/coupon-form' as any)}
          >
            <Icon name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.statCount, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statCount, { color: '#388E3C' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.statCount, { color: '#E65100' }]}>{stats.totalUsed}</Text>
          <Text style={styles.statLabel}>Used</Text>
        </View>
      </View>

      {/* Coupon List */}
      <FlatList
        data={coupons}
        keyExtractor={item => item.id}
        renderItem={renderCoupon}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="ticket-percent-outline" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No coupons yet</Text>
            <Text style={styles.emptyDesc}>Create your first coupon to attract customers</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/coupon-form' as any)}>
              <Icon name="plus" size={18} color="#FFF" />
              <Text style={styles.emptyBtnText}>Create Coupon</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  addButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOW.sm,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.sm },
  statCard: {
    flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  statCount: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* List */
  list: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: 100 },

  /* Coupon Card */
  couponCard: {
    backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, ...SHADOW.sm,
  },
  expiredCard: { opacity: 0.6 },

  couponTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  couponCode: { fontSize: 16, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  activeSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },

  couponTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  couponDesc: { fontSize: 12, color: COLORS.text.secondary, marginTop: 4, lineHeight: 17 },

  discountRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  discountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  discountValue: { fontSize: 14, fontWeight: '800' },
  discountType: { fontSize: 10, fontWeight: '700' },
  maxDiscountText: { fontSize: 11, color: COLORS.text.muted },
  minOrderText: { fontSize: 11, color: COLORS.text.muted },

  couponBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  usageInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  usageBar: { width: 60, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' },
  usageFill: { height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
  usageText: { fontSize: 11, color: COLORS.text.muted },

  validityInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  validityText: { fontSize: 11, color: COLORS.text.muted },

  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  categoryText: { fontSize: 11, color: COLORS.text.muted },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: 4 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: SPACING.lg,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
