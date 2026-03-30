import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useCoupons } from '@/context/CouponContext';
import type { Coupon } from '@/types';

export default function OffersScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { coupons } = useCoupons();
  const [termsExpanded, setTermsExpanded] = useState(false);

  const activeCoupons = useMemo(() => coupons.filter(c => c.isActive && new Date(c.validTo) >= new Date()), [coupons]);
  const topCoupons = activeCoupons.slice(0, 2);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const discountLabel = (coupon: Coupon) =>
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `\u20B9${coupon.discountValue} OFF`;

  const renderBestOffer = (coupon: Coupon, index: number) => (
    <LinearGradient
      key={coupon.id}
      colors={index === 0 ? themed.heroGradient : themed.primaryGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bestCard}
    >
      <View style={styles.bestBadge}>
        <Icon name="star-circle" size={16} color="#FFD700" />
        <Text style={styles.bestBadgeText}>BEST OFFER</Text>
      </View>
      <Text style={styles.bestDiscount}>{discountLabel(coupon)}</Text>
      <Text style={styles.bestTitle} numberOfLines={1}>{coupon.title}</Text>
      <Text style={styles.bestDesc} numberOfLines={2}>{coupon.description}</Text>
      <View style={styles.bestCodeRow}>
        <View style={styles.bestCodeBox}>
          <Text style={styles.bestCodeText}>{coupon.code}</Text>
        </View>
        <View style={styles.bestStatusBadge}>
          <Text style={styles.bestStatusText}>
            {coupon.usedCount}/{coupon.usageLimit} used
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCoupon = ({ item }: { item: Coupon }) => {
    const remaining = item.usageLimit - item.usedCount;

    return (
      <View style={[styles.couponCard, themed.card, { borderColor: themed.colors.border }]}>
        {/* Left dashed ticket border */}
        <View style={[styles.ticketLeft, { borderRightColor: themed.colors.border }]}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountLabel(item)}</Text>
          </View>
        </View>

        {/* Coupon body */}
        <View style={styles.couponBody}>
          <Text style={[styles.couponTitle, themed.textPrimary]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.couponDesc, themed.textSecondary]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Code box */}
          <View style={[styles.codeBox, { borderColor: themed.colors.border }]}>
            <Text style={[styles.codeText, themed.textPrimary]}>{item.code}</Text>
            <Icon name="content-copy" size={14} color={COLORS.text.muted} />
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Min order: {'\u20B9'}{item.minOrderValue}</Text>
            <Text style={styles.metaDot}>{'\u00B7'}</Text>
            <Text style={styles.metaText}>Valid till {formatDate(item.validTo)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{remaining} use{remaining !== 1 ? 's' : ''} remaining</Text>
            {item.maxDiscount && item.discountType === 'percentage' && (
              <>
                <Text style={styles.metaDot}>{'\u00B7'}</Text>
                <Text style={styles.metaText}>Max save {'\u20B9'}{item.maxDiscount}</Text>
              </>
            )}
          </View>

          {/* Category tag */}
          {item.category ? (
            <View style={[styles.categoryTag, themed.softBg]}>
              <Icon name="tag-outline" size={12} color={COLORS.primary} />
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          ) : null}

          {/* Edit button */}
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/coupon-form', params: { id: item.id } } as any)}
          >
            <Icon name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Ticket notch decorations */}
        <View style={[styles.notchTop, { backgroundColor: themed.colors.background }]} />
        <View style={[styles.notchBottom, { backgroundColor: themed.colors.background }]} />
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Customer Preview Banner */}
      <View style={[styles.previewBanner, themed.card]}>
        <Icon name="eye-outline" size={18} color={COLORS.primary} />
        <Text style={styles.previewText}>Customer view of your active offers</Text>
      </View>

      {/* Best Offers Section */}
      {topCoupons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="fire" size={20} color={COLORS.status.warning} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Best Offers</Text>
          </View>
          {topCoupons.map((c, i) => renderBestOffer(c, i))}
        </View>
      )}

      {/* Section label for available coupons */}
      {activeCoupons.length > 0 && (
        <View style={styles.sectionHeader}>
          <Icon name="ticket-confirmation-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.sectionTitle, themed.textPrimary]}>All Active Coupons ({activeCoupons.length})</Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <View style={{ paddingBottom: 40 }}>
      {activeCoupons.length === 0 && (
        <View style={styles.empty}>
          <Icon name="ticket-percent-outline" size={56} color={COLORS.text.muted} />
          <Text style={styles.emptyTitle}>No Active Offers</Text>
          <Text style={styles.emptyHint}>Create coupons to show offers to your customers</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/coupon-form' as any)}>
            <Icon name="plus" size={18} color="#FFF" />
            <Text style={styles.emptyBtnText}>Create Coupon</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Coupon Terms */}
      <TouchableOpacity
        style={[styles.termsHeader, themed.card, { borderColor: themed.colors.border }]}
        activeOpacity={0.8}
        onPress={() => setTermsExpanded(!termsExpanded)}
      >
        <View style={styles.termsHeaderRow}>
          <Icon name="information-outline" size={18} color={COLORS.text.secondary} />
          <Text style={[styles.termsTitle, themed.textPrimary]}>Coupon Terms (shown to customers)</Text>
        </View>
        <Icon
          name={termsExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={COLORS.text.muted}
        />
      </TouchableOpacity>
      {termsExpanded && (
        <View style={[styles.termsBody, themed.card]}>
          <Text style={[styles.termsText, themed.textSecondary]}>
            {'\u2022'} Coupons are applicable on eligible orders only.{'\n'}
            {'\u2022'} Only one coupon can be applied per order.{'\n'}
            {'\u2022'} Discount is applied on the cart total before delivery charges.{'\n'}
            {'\u2022'} Coupons cannot be combined with other promotions unless stated.{'\n'}
            {'\u2022'} Soruban Cutting reserves the right to modify or revoke coupons at any time.{'\n'}
            {'\u2022'} Category-specific coupons apply only to items in that category.{'\n'}
            {'\u2022'} Expired or fully redeemed coupons cannot be applied.
          </Text>
        </View>
      )}
    </View>
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
          <Text style={[styles.headerTitle, themed.textPrimary]}>Offers & Coupons</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/coupon-form' as any)}
          >
            <Icon name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <FlatList
        data={activeCoupons}
        keyExtractor={(item) => item.id}
        renderItem={renderCoupon}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  addButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOW.sm,
  },

  list: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },

  previewBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
  },
  previewText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  section: { marginBottom: SPACING.base },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: SPACING.md, gap: SPACING.xs,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  // Best Offer Cards
  bestCard: {
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, ...SHADOW.md,
  },
  bestBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.xs },
  bestBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFD700', letterSpacing: 1 },
  bestDiscount: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  bestTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  bestDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: SPACING.md, lineHeight: 17 },
  bestCodeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bestCodeBox: {
    flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.sm, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md, alignItems: 'center',
  },
  bestCodeText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  bestStatusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md,
  },
  bestStatusText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // Coupon Card (ticket style)
  couponCard: {
    flexDirection: 'row', borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOW.sm,
  },
  ticketLeft: {
    width: 84, borderRightWidth: 1.5, borderRightColor: COLORS.border,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
    paddingVertical: SPACING.base,
  },
  discountBadge: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm,
    transform: [{ rotate: '-90deg' }], minWidth: 80, alignItems: 'center',
  },
  discountBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  couponBody: { flex: 1, padding: SPACING.md },
  couponTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  couponDesc: { fontSize: 12, lineHeight: 17, marginBottom: SPACING.sm },

  codeBox: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md, gap: SPACING.xs, marginBottom: SPACING.sm,
  },
  codeText: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: COLORS.text.muted },
  metaDot: { fontSize: 11, color: COLORS.text.muted, marginHorizontal: 4 },

  categoryTag: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 4, paddingVertical: 2, paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full, marginTop: SPACING.xs, marginBottom: SPACING.xs,
  },
  categoryTagText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'capitalize' },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end',
    backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs, borderWidth: 1, borderColor: COLORS.primary,
  },
  editBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

  notchTop: {
    position: 'absolute', top: -10, right: -10,
    width: 20, height: 20, borderRadius: 10,
  },
  notchBottom: {
    position: 'absolute', bottom: -10, right: -10,
    width: 20, height: 20, borderRadius: 10,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.muted, marginTop: SPACING.md },
  emptyHint: { fontSize: 12, color: COLORS.text.muted, marginTop: SPACING.xs },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: SPACING.lg,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Terms
  termsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: RADIUS.lg, padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.md,
  },
  termsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  termsTitle: { fontSize: 14, fontWeight: '700' },
  termsBody: {
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg, paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base, paddingTop: SPACING.sm, marginTop: -SPACING.sm,
  },
  termsText: { fontSize: 12, lineHeight: 20 },
});
