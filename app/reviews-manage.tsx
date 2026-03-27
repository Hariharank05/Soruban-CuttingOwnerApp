// app/reviews-manage.tsx - Review & Order Feedback Moderation Screen
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useReviews } from '@/context/ReviewContext';
import type { ProductReview, OrderRating } from '@/types';

type MainTab = 'reviews' | 'feedback';
type FilterKey = 'all' | 'published' | 'flagged' | 'hidden';
type FeedbackFilter = 'all' | 'positive' | 'mixed' | 'negative';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  published: { label: 'Published', bg: '#E8F5E9', color: '#2E7D32' },
  flagged: { label: 'Flagged', bg: '#FFEBEE', color: '#C62828' },
  hidden: { label: 'Hidden', bg: '#F5F5F5', color: '#757575' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'hidden', label: 'Hidden' },
];

const FEEDBACK_FILTERS: { key: FeedbackFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'positive', label: '4-5 Stars' },
  { key: 'mixed', label: '3 Stars' },
  { key: 'negative', label: '1-2 Stars' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Icon
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? '#FFA726' : '#CBD5E0'}
        />
      ))}
    </View>
  );
}

function CategoryRatingBar({ label, icon, rating, color }: { label: string; icon: string; rating: number; color: string }) {
  const fillWidth = (rating / 5) * 100;
  return (
    <View style={styles.categoryBar}>
      <View style={styles.categoryBarLeft}>
        <Icon name={icon as any} size={14} color={color} />
        <Text style={styles.categoryBarLabel}>{label}</Text>
      </View>
      <View style={styles.categoryBarTrack}>
        <View style={[styles.categoryBarFill, { width: `${fillWidth}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.categoryBarValue, { color }]}>{rating}</Text>
    </View>
  );
}

export default function ReviewsManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [mainTab, setMainTab] = useState<MainTab>('reviews');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const { reviews, orderRatings, updateStatus, replyToReview, deleteReview } = useReviews();

  // ─── Product Reviews Stats ───
  const reviewStats = useMemo(() => {
    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const published = reviews.filter(r => r.status === 'published').length;
    const flagged = reviews.filter(r => r.status === 'flagged').length;
    return { total, avgRating: avgRating.toFixed(1), published, flagged };
  }, [reviews]);

  // ─── Order Feedback Stats ───
  const feedbackStats = useMemo(() => {
    const total = orderRatings.length;
    if (total === 0) return { total: 0, avgOverall: '0.0', avgFreshness: '0.0', avgCutting: '0.0', avgDelivery: '0.0' };
    const avgOverall = orderRatings.reduce((s, r) => s + r.overallRating, 0) / total;
    const avgFreshness = orderRatings.reduce((s, r) => s + r.freshnessRating, 0) / total;
    const avgCutting = orderRatings.reduce((s, r) => s + r.cuttingRating, 0) / total;
    const avgDelivery = orderRatings.reduce((s, r) => s + r.deliveryRating, 0) / total;
    return {
      total,
      avgOverall: avgOverall.toFixed(1),
      avgFreshness: avgFreshness.toFixed(1),
      avgCutting: avgCutting.toFixed(1),
      avgDelivery: avgDelivery.toFixed(1),
    };
  }, [orderRatings]);

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter(r => r.status === filter);
  }, [reviews, filter]);

  const filteredFeedback = useMemo(() => {
    if (feedbackFilter === 'all') return orderRatings;
    if (feedbackFilter === 'positive') return orderRatings.filter(r => r.overallRating >= 4);
    if (feedbackFilter === 'mixed') return orderRatings.filter(r => r.overallRating === 3);
    return orderRatings.filter(r => r.overallRating <= 2);
  }, [orderRatings, feedbackFilter]);

  const handleReply = (review: ProductReview) => {
    Alert.alert(
      'Reply to Review',
      `Reply to ${review.customerName}'s review on ${review.productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Thank You Reply', onPress: () => {
          replyToReview(review.id, 'Thank you for your feedback! We appreciate it.');
          Alert.alert('Success', 'Reply posted successfully.');
        }},
        { text: 'Apology Reply', onPress: () => {
          replyToReview(review.id, 'We sincerely apologize for the inconvenience. We will ensure this does not happen again.');
          Alert.alert('Success', 'Reply posted successfully.');
        }},
      ]
    );
  };

  const handleChangeStatus = (review: ProductReview) => {
    Alert.alert(
      'Change Review Status',
      `Current status: ${STATUS_CONFIG[review.status]?.label || review.status}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Publish', onPress: () => updateStatus(review.id, 'published') },
        { text: 'Flag', style: 'destructive', onPress: () => updateStatus(review.id, 'flagged') },
        { text: 'Hide', onPress: () => updateStatus(review.id, 'hidden') },
      ]
    );
  };

  const handleDelete = (review: ProductReview) => {
    Alert.alert(
      'Delete Review',
      `Are you sure you want to delete ${review.customerName}'s review? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteReview(review.id) },
      ]
    );
  };

  // ─── Stat Cards ───
  const renderReviewStatCards = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Icon name="message-text-outline" size={18} color="#1565C0" />
        <Text style={[styles.statValue, { color: '#1565C0' }]}>{reviewStats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
        <Icon name="star" size={18} color="#E65100" />
        <Text style={[styles.statValue, { color: '#E65100' }]}>{reviewStats.avgRating}</Text>
        <Text style={styles.statLabel}>Avg Rating</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
        <Icon name="check-circle" size={18} color="#2E7D32" />
        <Text style={[styles.statValue, { color: '#2E7D32' }]}>{reviewStats.published}</Text>
        <Text style={styles.statLabel}>Published</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
        <Icon name="flag" size={18} color="#C62828" />
        <Text style={[styles.statValue, { color: '#C62828' }]}>{reviewStats.flagged}</Text>
        <Text style={styles.statLabel}>Flagged</Text>
      </View>
    </View>
  );

  const renderFeedbackStatCards = () => (
    <View style={styles.feedbackStatsWrap}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="clipboard-check-outline" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{feedbackStats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="star" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{feedbackStats.avgOverall}</Text>
          <Text style={styles.statLabel}>Overall</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="leaf" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{feedbackStats.avgFreshness}</Text>
          <Text style={styles.statLabel}>Freshness</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="knife" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{feedbackStats.avgCutting}</Text>
          <Text style={styles.statLabel}>Cutting</Text>
        </View>
      </View>
    </View>
  );

  // ─── Product Review Card ───
  const renderReviewCard = ({ item }: { item: ProductReview }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.published;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.avatarText, { color: '#2E7D32' }]}>
                {item.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.cardName}>{item.customerName}</Text>
              <Text style={styles.productName}>{item.productName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <StarRating rating={item.rating} />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.commentText}>{item.comment}</Text>

        {item.ownerReply && (
          <View style={styles.replySection}>
            <View style={styles.replyHeader}>
              <Icon name="reply" size={14} color={COLORS.primary} />
              <Text style={styles.replyLabel}>Owner Reply</Text>
            </View>
            <Text style={styles.replyText}>{item.ownerReply}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => handleReply(item)}>
            <Icon name="reply" size={14} color="#1565C0" />
            <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => handleChangeStatus(item)}>
            <Icon name="swap-horizontal" size={14} color="#E65100" />
            <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]} onPress={() => handleDelete(item)}>
            <Icon name="delete-outline" size={14} color="#C62828" />
            <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Order Feedback Card ───
  const renderFeedbackCard = ({ item }: { item: OrderRating }) => {
    const ratingColor = item.overallRating >= 4 ? '#2E7D32' : item.overallRating === 3 ? '#E65100' : '#C62828';
    const ratingBg = item.overallRating >= 4 ? '#E8F5E9' : item.overallRating === 3 ? '#FFF3E0' : '#FFEBEE';
    return (
      <View style={styles.card}>
        {/* Header with customer info */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: ratingBg }]}>
              <Text style={[styles.avatarText, { color: ratingColor }]}>
                {item.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.cardName}>{item.customerName}</Text>
              <Text style={styles.productName}>Order #{item.orderId.slice(-4)}</Text>
            </View>
          </View>
          <View style={[styles.overallBadge, { backgroundColor: ratingBg }]}>
            <Icon name="star" size={14} color={ratingColor} />
            <Text style={[styles.overallBadgeText, { color: ratingColor }]}>{item.overallRating}</Text>
          </View>
        </View>

        {/* Category Ratings */}
        <View style={styles.categoryRatings}>
          <CategoryRatingBar label="Freshness" icon="leaf" rating={item.freshnessRating} color="#2E7D32" />
          <CategoryRatingBar label="Cutting" icon="knife" rating={item.cuttingRating} color="#7B1FA2" />
          <CategoryRatingBar label="Delivery" icon="truck-delivery" rating={item.deliveryRating} color="#1565C0" />
        </View>

        {/* Comment */}
        {item.comment ? (
          <Text style={styles.commentText}>{item.comment}</Text>
        ) : null}

        {/* Footer */}
        <View style={styles.feedbackFooter}>
          <View style={styles.feedbackFooterLeft}>
            <Icon name="clock-outline" size={12} color={COLORS.text.muted} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          {item.customerPhone && (
            <View style={styles.feedbackFooterLeft}>
              <Icon name="phone-outline" size={12} color={COLORS.text.muted} />
              <Text style={styles.dateText}>{item.customerPhone}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = (message: string) => (
    <View style={styles.empty}>
      <Icon name="message-text-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No {message} found</Text>
      <Text style={styles.emptySub}>
        Customer {message} will appear here once they start submitting them
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reviews & Feedback</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Main Tab Switcher ── */}
      <View style={styles.mainTabRow}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'reviews' && styles.mainTabActive]}
          onPress={() => setMainTab('reviews')}
        >
          <Icon name="message-text-outline" size={16} color={mainTab === 'reviews' ? '#FFF' : COLORS.text.muted} />
          <Text style={[styles.mainTabText, mainTab === 'reviews' && styles.mainTabTextActive]}>
            Product Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'feedback' && styles.mainTabActive]}
          onPress={() => setMainTab('feedback')}
        >
          <Icon name="clipboard-check-outline" size={16} color={mainTab === 'feedback' ? '#FFF' : COLORS.text.muted} />
          <Text style={[styles.mainTabText, mainTab === 'feedback' && styles.mainTabTextActive]}>
            Order Feedback
          </Text>
        </TouchableOpacity>
      </View>

      {mainTab === 'reviews' ? (
        <>
          {renderReviewStatCards()}

          <View style={styles.filterRow}>
            {FILTER_TABS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
                onPress={() => setFilter(item.key)}
              >
                <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredReviews}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => renderEmptyState('reviews')}
            renderItem={renderReviewCard}
          />
        </>
      ) : (
        <>
          {renderFeedbackStatCards()}

          <View style={styles.filterRow}>
            {FEEDBACK_FILTERS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, feedbackFilter === item.key && styles.filterChipActive]}
                onPress={() => setFeedbackFilter(item.key)}
              >
                <Text style={[styles.filterChipText, feedbackFilter === item.key && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredFeedback}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => renderEmptyState('feedback')}
            renderItem={renderFeedbackCard}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  /* ── Main Tab Switcher ── */
  mainTabRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm,
  },
  mainTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg, backgroundColor: '#F5F5F5',
  },
  mainTabActive: { backgroundColor: COLORS.primary },
  mainTabText: { fontSize: 13, fontWeight: '700', color: COLORS.text.muted },
  mainTabTextActive: { color: '#FFF' },

  /* ── Stats ── */
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  feedbackStatsWrap: {},
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  /* ── Filters ── */
  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* ── Card ── */
  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { fontSize: 16, fontWeight: '800' },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  productName: { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  dateText: { fontSize: 11, color: COLORS.text.muted },

  commentText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20, marginBottom: SPACING.sm },

  replySection: { backgroundColor: '#F8FBF9', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  replyLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  replyText: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 18 },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  /* ── Overall Badge (Order Feedback) ── */
  overallBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  overallBadgeText: { fontSize: 14, fontWeight: '800' },

  /* ── Category Rating Bars ── */
  categoryRatings: { marginBottom: SPACING.sm, gap: SPACING.xs + 2 },
  categoryBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  categoryBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 85 },
  categoryBarLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },
  categoryBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  categoryBarFill: { height: 6, borderRadius: 3 },
  categoryBarValue: { fontSize: 12, fontWeight: '800', width: 20, textAlign: 'right' },

  /* ── Feedback Footer ── */
  feedbackFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm,
  },
  feedbackFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  /* ── Empty ── */
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
