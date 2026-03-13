import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useSubscriptions } from '@/context/SubscriptionContext';

const FREQ_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  daily: { color: '#388E3C', bg: '#E8F5E9', icon: 'calendar-today' },
  weekly: { color: '#1565C0', bg: '#E3F2FD', icon: 'calendar-week' },
  monthly: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'calendar-month' },
};

const STATUS_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  active: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle' },
  paused: { color: '#E65100', bg: '#FFF3E0', icon: 'pause-circle' },
  cancelled: { color: '#C62828', bg: '#FFEBEE', icon: 'close-circle' },
};

export default function SubscriptionDetailScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions, updateSubscriptionStatus } = useSubscriptions();

  const subscription = useMemo(() => {
    return subscriptions.find(s => s.id === id);
  }, [subscriptions, id]);

  if (!subscription) {
    return (
      <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
        <LinearGradient colors={themed.headerGradient} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, themed.textPrimary]}>Subscription</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank-outline" size={56} color={COLORS.text.muted} />
          <Text style={styles.emptyTitle}>Subscription not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const freq = FREQ_CONFIG[subscription.frequency] || FREQ_CONFIG.daily;
  const statusStyle = STATUS_COLORS[subscription.status] || STATUS_COLORS.active;

  const handleStatusChange = (newStatus: 'active' | 'paused' | 'cancelled') => {
    const labels: Record<string, string> = { active: 'Activate', paused: 'Pause', cancelled: 'Cancel' };
    Alert.alert(
      `${labels[newStatus]} Subscription`,
      `Are you sure you want to ${labels[newStatus].toLowerCase()} this subscription?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: newStatus === 'cancelled' ? 'destructive' : 'default',
          onPress: () => updateSubscriptionStatus?.(subscription.id, newStatus),
        },
      ],
    );
  };

  const monthlyEstimate = useMemo(() => {
    const base = subscription.totalAmount || 0;
    if (subscription.frequency === 'daily') return base * 30;
    if (subscription.frequency === 'weekly') return base * 4;
    return base;
  }, [subscription]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Subscription Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Customer Info Card */}
        <View style={[styles.card, themed.card]}>
          <View style={styles.customerRow}>
            <View style={styles.avatarWrap}>
              <Icon name="account" size={24} color="#FFF" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{subscription.customerName || 'Customer'}</Text>
              <Text style={styles.customerId}>ID: {subscription.customerId}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Icon name={statusStyle.icon as any} size={14} color={statusStyle.color} />
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Frequency & Schedule Card */}
        <View style={[styles.card, themed.card]}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <View style={styles.scheduleGrid}>
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: freq.bg }]}>
                <Icon name={freq.icon as any} size={20} color={freq.color} />
              </View>
              <Text style={styles.scheduleLabel}>Frequency</Text>
              <Text style={styles.scheduleValue}>
                {subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
              </Text>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="clock-outline" size={20} color="#1565C0" />
              </View>
              <Text style={styles.scheduleLabel}>Preferred Time</Text>
              <Text style={styles.scheduleValue}>{subscription.preferredTime || 'Not set'}</Text>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="calendar-start" size={20} color="#E65100" />
              </View>
              <Text style={styles.scheduleLabel}>Start Date</Text>
              <Text style={styles.scheduleValue}>
                {new Date(subscription.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            {subscription.weeklyDay && (
              <View style={styles.scheduleItem}>
                <View style={[styles.scheduleIconWrap, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="calendar-week" size={20} color="#7B1FA2" />
                </View>
                <Text style={styles.scheduleLabel}>Day</Text>
                <Text style={styles.scheduleValue}>{subscription.weeklyDay}</Text>
              </View>
            )}

            {subscription.monthlyDates && subscription.monthlyDates.length > 0 && (
              <View style={styles.scheduleItem}>
                <View style={[styles.scheduleIconWrap, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="calendar-month" size={20} color="#7B1FA2" />
                </View>
                <Text style={styles.scheduleLabel}>Dates</Text>
                <Text style={styles.scheduleValue}>{subscription.monthlyDates.join(', ')}</Text>
              </View>
            )}
          </View>

          {/* Paused info */}
          {subscription.status === 'paused' && subscription.pausedUntil && (
            <View style={styles.pausedBanner}>
              <Icon name="pause-circle-outline" size={18} color="#E65100" />
              <Text style={styles.pausedBannerText}>
                Paused until {new Date(subscription.pausedUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Items Card */}
        <View style={[styles.card, themed.card]}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Items</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{subscription.items?.length || 0}</Text>
            </View>
          </View>

          {subscription.items?.map((item, idx) => (
            <View key={idx} style={[styles.itemRow, idx < (subscription.items?.length || 0) - 1 && styles.itemBorder]}>
              <View style={styles.itemDot} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name || 'Item'}</Text>
                <View style={styles.itemMeta}>
                  {item.quantity ? <Text style={styles.itemQty}>x{item.quantity}</Text> : null}
                  {item.cutType ? (
                    <View style={styles.cutTypeBadge}>
                      <Icon name="content-cut" size={10} color="#7B1FA2" />
                      <Text style={styles.cutTypeText}>{item.cutType.replace(/_/g, ' ')}</Text>
                    </View>
                  ) : null}
                  {item.selectedWeight ? <Text style={styles.itemWeight}>{item.selectedWeight}g</Text> : null}
                </View>
              </View>
              <Text style={styles.itemPrice}>{'\u20B9'}{item.price || 0}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Card */}
        <View style={[styles.card, themed.card]}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Per Delivery</Text>
            <Text style={styles.priceValue}>{'\u20B9'}{subscription.totalAmount || 0}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated Monthly</Text>
            <Text style={[styles.priceValue, { color: COLORS.primary }]}>
              {'\u20B9'}{monthlyEstimate > 1000 ? `${(monthlyEstimate / 1000).toFixed(1)}K` : monthlyEstimate}
            </Text>
          </View>
        </View>

        {/* Skipped Deliveries */}
        {subscription.skippedDeliveries && subscription.skippedDeliveries.length > 0 && (
          <View style={[styles.card, themed.card]}>
            <Text style={styles.cardTitle}>Skipped Deliveries</Text>
            {subscription.skippedDeliveries.map((skip, idx) => (
              <View key={idx} style={styles.skipRow}>
                <Icon name="calendar-remove" size={16} color="#E65100" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.skipDate}>
                    {new Date(skip.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </Text>
                  {skip.reason && <Text style={styles.skipReason}>{skip.reason}</Text>}
                </View>
                <View style={[styles.skipStatusBadge, { backgroundColor: skip.status === 'skipped' ? '#FFF3E0' : '#FFEBEE' }]}>
                  <Text style={[styles.skipStatusText, { color: skip.status === 'skipped' ? '#E65100' : '#C62828' }]}>
                    {skip.status === 'skipped' ? 'Skipped' : 'Too Late'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {subscription.status === 'active' && (
            <TouchableOpacity style={styles.pauseBtn} onPress={() => handleStatusChange('paused')}>
              <Icon name="pause-circle-outline" size={20} color="#E65100" />
              <Text style={styles.pauseBtnText}>Pause Subscription</Text>
            </TouchableOpacity>
          )}

          {subscription.status === 'paused' && (
            <TouchableOpacity style={styles.activateBtn} onPress={() => handleStatusChange('active')}>
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.activateBtnGradient}>
                <Icon name="play-circle-outline" size={20} color="#FFF" />
                <Text style={styles.activateBtnText}>Resume Subscription</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {subscription.status !== 'cancelled' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleStatusChange('cancelled')}>
              <Icon name="close-circle-outline" size={20} color="#C62828" />
              <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, paddingBottom: 100 },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  /* Card */
  card: {
    backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, ...SHADOW.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },

  /* Customer */
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary },
  customerId: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full,
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  /* Schedule */
  scheduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  scheduleItem: {
    width: '47%', flexGrow: 1, backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center',
  },
  scheduleIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  scheduleLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },
  scheduleValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginTop: 2, textAlign: 'center' },

  pausedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF3E0', borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md,
  },
  pausedBannerText: { fontSize: 13, fontWeight: '600', color: '#E65100', flex: 1 },

  /* Items */
  itemCountBadge: {
    minWidth: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  itemCountText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  itemQty: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  cutTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F3E5F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  cutTypeText: { fontSize: 10, fontWeight: '600', color: '#7B1FA2', textTransform: 'capitalize' },
  itemWeight: { fontSize: 12, color: COLORS.text.muted },
  itemPrice: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  /* Pricing */
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  priceLabel: { fontSize: 14, color: COLORS.text.secondary },
  priceValue: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },

  /* Skipped */
  skipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  skipDate: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  skipReason: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  skipStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  skipStatusText: { fontSize: 10, fontWeight: '700' },

  /* Actions */
  actionsSection: { marginTop: SPACING.sm },
  pauseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: '#E65100', backgroundColor: '#FFF',
    marginBottom: SPACING.sm,
  },
  pauseBtnText: { fontSize: 15, fontWeight: '700', color: '#E65100' },

  activateBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm },
  activateBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16,
  },
  activateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: '#C62828', backgroundColor: '#FFF',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#C62828' },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.md },
});
