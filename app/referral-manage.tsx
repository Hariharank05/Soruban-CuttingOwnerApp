// app/referral-manage.tsx - Referral Program Management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useReferrals } from '@/context/ReferralContext';
import type { Referral, ReferralConfig } from '@/types';

type FilterKey = 'all' | 'completed' | 'pending' | 'expired';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  completed: { label: 'Completed', bg: '#E8F5E9', color: '#2E7D32' },
  pending: { label: 'Pending', bg: '#FFF3E0', color: '#E65100' },
  expired: { label: 'Expired', bg: '#F5F5F5', color: '#757575' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'expired', label: 'Expired' },
];

const REWARD_TYPE_LABEL: Record<string, string> = {
  wallet_credit: 'Wallet Credit',
  discount_percent: 'Discount %',
  flat_discount: 'Flat Discount',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReferralManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { referrals, config } = useReferrals();
  const [filter, setFilter] = useState<FilterKey>('all');

  const stats = useMemo(() => {
    const total = referrals.length;
    const completed = referrals.filter(r => r.status === 'completed').length;
    const pending = referrals.filter(r => r.status === 'pending').length;
    const totalRewards = referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.rewardAmount, 0);
    const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    return { total, completed, pending, totalRewards, conversionRate };
  }, [referrals]);

  const filtered = useMemo(() => {
    if (filter === 'all') return referrals;
    return referrals.filter(r => r.status === filter);
  }, [referrals, filter]);

  const handleEditConfig = () => {
    Alert.alert(
      'Edit Referral Config',
      'This will open the referral configuration editor. In production, this navigates to a form screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Toggle Program', onPress: () => {
          Alert.alert('Config Updated', `Referral program ${config?.isEnabled ? 'disabled' : 'enabled'} successfully.`);
        }},
      ]
    );
  };

  const renderConfigCard = () => {
    if (!config) return null;
    return (
      <View style={styles.configCard}>
        <View style={styles.configHeader}>
          <View style={styles.configHeaderLeft}>
            <Icon name="cog" size={20} color={COLORS.primary} />
            <Text style={styles.configTitle}>Referral Configuration</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditConfig}>
            <Icon name="pencil" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.configGrid}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Status</Text>
            <View style={[styles.toggleBadge, { backgroundColor: config.isEnabled ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.toggleBadgeText, { color: config.isEnabled ? '#2E7D32' : '#C62828' }]}>
                {config.isEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Referrer Reward</Text>
            <Text style={styles.configValue}>Rs. {config.referrerReward}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Referee Reward</Text>
            <Text style={styles.configValue}>Rs. {config.refereeReward}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Reward Type</Text>
            <Text style={styles.configValue}>{REWARD_TYPE_LABEL[config.rewardType] || config.rewardType}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Min Order</Text>
            <Text style={styles.configValue}>Rs. {config.minOrderForReward}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Max Referrals</Text>
            <Text style={styles.configValue}>{config.maxReferrals}</Text>
          </View>
        </View>

        <View style={styles.conversionRow}>
          <Icon name="chart-line" size={16} color={COLORS.primary} />
          <Text style={styles.conversionText}>Conversion Rate: </Text>
          <Text style={styles.conversionValue}>{stats.conversionRate}%</Text>
        </View>
      </View>
    );
  };

  const renderReferralCard = ({ item }: { item: Referral }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.rewardAmount}>Rs. {item.rewardAmount}</Text>
        </View>

        <View style={styles.referralFlow}>
          <View style={styles.personBlock}>
            <View style={[styles.avatarCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.avatarText, { color: '#1565C0' }]}>
                {item.referrerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.personName} numberOfLines={1}>{item.referrerName}</Text>
            <Text style={styles.personPhone}>{item.referrerPhone}</Text>
            <Text style={styles.personRole}>Referrer</Text>
          </View>

          <View style={styles.arrowContainer}>
            <Icon name="arrow-right-bold" size={22} color={COLORS.primary} />
            <Text style={styles.arrowLabel}>Referred</Text>
          </View>

          <View style={styles.personBlock}>
            <View style={[styles.avatarCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.avatarText, { color: '#2E7D32' }]}>
                {item.refereeName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.personName} numberOfLines={1}>{item.refereeName}</Text>
            <Text style={styles.personPhone}>{item.refereePhone}</Text>
            <Text style={styles.personRole}>Referee</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateItem}>
            <Icon name="calendar" size={12} color={COLORS.text.muted} />
            <Text style={styles.dateText}>Created: {formatDate(item.createdAt)}</Text>
          </View>
          {item.completedAt && (
            <View style={styles.dateItem}>
              <Icon name="check" size={12} color="#2E7D32" />
              <Text style={[styles.dateText, { color: '#2E7D32' }]}>Completed: {formatDate(item.completedAt)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="account-group-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No referrals found</Text>
      <Text style={styles.emptySub}>
        Referral entries will appear here when customers refer friends to your store
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Referral Program</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="account-group" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="check-circle" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="clock-outline" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="currency-inr" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.totalRewards}</Text>
          <Text style={styles.statLabel}>Rewards</Text>
        </View>
      </View>

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
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderConfigCard}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderReferralCard}
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
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  configCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.lg, ...SHADOW.sm, borderWidth: 1, borderColor: COLORS.primaryLight + '40' },
  configHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  configHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  configTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.backgroundSoft, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  editBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  configGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  configItem: { width: '47%', backgroundColor: '#F9FAFB', borderRadius: RADIUS.md, padding: SPACING.sm },
  configLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted, marginBottom: 3 },
  configValue: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  toggleBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  toggleBadgeText: { fontSize: 11, fontWeight: '700' },

  conversionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm },
  conversionText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  conversionValue: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  rewardAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },

  referralFlow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  personBlock: { flex: 1, alignItems: 'center' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  avatarText: { fontSize: 16, fontWeight: '800' },
  personName: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center' },
  personPhone: { fontSize: 10, color: COLORS.text.muted, marginTop: 1 },
  personRole: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted, marginTop: 2, textTransform: 'uppercase' },
  arrowContainer: { paddingHorizontal: SPACING.sm, alignItems: 'center' },
  arrowLabel: { fontSize: 8, fontWeight: '700', color: COLORS.primary, marginTop: 2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.xs },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dateText: { fontSize: 11, color: COLORS.text.muted },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
