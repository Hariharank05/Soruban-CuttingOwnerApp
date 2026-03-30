// app/loyalty-tiers.tsx - Loyalty Tier Configuration
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { LoyaltyTierConfig, CheckInConfig, CustomerLoyalty } from '@/types';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const TIER_BG: Record<string, string> = {
  bronze: '#FFF3E0',
  silver: '#F5F5F5',
  gold: '#FFFDE7',
  platinum: '#F3E5F5',
};

const TIER_ICONS: Record<string, string> = {
  bronze: 'shield-outline',
  silver: 'shield-half-full',
  gold: 'shield-star',
  platinum: 'shield-crown',
};

const DEFAULT_TIERS: LoyaltyTierConfig[] = [
  { tier: 'bronze', name: 'Bronze', minPoints: 0, discountPercent: 2, freeDelivery: false, prioritySupport: false, exclusiveOffers: false, color: '#CD7F32', icon: 'shield-outline' },
  { tier: 'silver', name: 'Silver', minPoints: 500, discountPercent: 5, freeDelivery: false, prioritySupport: true, exclusiveOffers: false, color: '#C0C0C0', icon: 'shield-half-full' },
  { tier: 'gold', name: 'Gold', minPoints: 1500, discountPercent: 10, freeDelivery: true, prioritySupport: true, exclusiveOffers: true, color: '#FFD700', icon: 'shield-star' },
  { tier: 'platinum', name: 'Platinum', minPoints: 5000, discountPercent: 15, freeDelivery: true, prioritySupport: true, exclusiveOffers: true, color: '#E5E4E2', icon: 'shield-crown' },
];

const DEFAULT_CHECKIN: CheckInConfig = {
  isEnabled: true,
  dailyPoints: 10,
  streakBonus: 50,
  streakDays: 7,
  maxStreak: 30,
  updatedAt: '2026-03-20T10:00:00Z',
};

const DEMO_CUSTOMERS: CustomerLoyalty[] = [
  { customerId: 'c1', customerName: 'Priya Sharma', tier: 'gold', totalPoints: 2400, currentPoints: 890, currentStreak: 12, longestStreak: 18, lastCheckIn: '2026-03-24' },
  { customerId: 'c2', customerName: 'Ravi Kumar', tier: 'silver', totalPoints: 820, currentPoints: 320, currentStreak: 3, longestStreak: 10, lastCheckIn: '2026-03-25' },
  { customerId: 'c3', customerName: 'Meena K', tier: 'platinum', totalPoints: 6200, currentPoints: 1200, currentStreak: 22, longestStreak: 28, lastCheckIn: '2026-03-25' },
  { customerId: 'c4', customerName: 'Arun Patel', tier: 'bronze', totalPoints: 150, currentPoints: 150, currentStreak: 5, longestStreak: 5, lastCheckIn: '2026-03-23' },
  { customerId: 'c5', customerName: 'Kavitha Raj', tier: 'gold', totalPoints: 3100, currentPoints: 600, currentStreak: 0, longestStreak: 14 },
  { customerId: 'c6', customerName: 'Lakshmi S', tier: 'silver', totalPoints: 710, currentPoints: 210, currentStreak: 7, longestStreak: 7, lastCheckIn: '2026-03-25' },
  { customerId: 'c7', customerName: 'Suresh Menon', tier: 'bronze', totalPoints: 80, currentPoints: 80, currentStreak: 1, longestStreak: 3, lastCheckIn: '2026-03-24' },
  { customerId: 'c8', customerName: 'Deepa V', tier: 'silver', totalPoints: 950, currentPoints: 450, currentStreak: 9, longestStreak: 15, lastCheckIn: '2026-03-25' },
  { customerId: 'c9', customerName: 'Ganesh R', tier: 'bronze', totalPoints: 220, currentPoints: 220, currentStreak: 2, longestStreak: 6, lastCheckIn: '2026-03-22' },
  { customerId: 'c10', customerName: 'Anu M', tier: 'gold', totalPoints: 1800, currentPoints: 300, currentStreak: 4, longestStreak: 12, lastCheckIn: '2026-03-24' },
];

const STORAGE_TIERS_KEY = '@owner_loyalty_tiers';
const STORAGE_CHECKIN_KEY = '@owner_checkin_config';

export default function LoyaltyTiersScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [tiers, setTiers] = useState<LoyaltyTierConfig[]>(DEFAULT_TIERS);
  const [checkInConfig, setCheckInConfig] = useState<CheckInConfig>(DEFAULT_CHECKIN);
  const [customers] = useState<CustomerLoyalty[]>(DEMO_CUSTOMERS);

  useEffect(() => {
    (async () => {
      const storedTiers = await getStoredData<LoyaltyTierConfig[]>(STORAGE_TIERS_KEY, DEFAULT_TIERS);
      const storedCheckIn = await getStoredData<CheckInConfig>(STORAGE_CHECKIN_KEY, DEFAULT_CHECKIN);
      setTiers(storedTiers);
      setCheckInConfig(storedCheckIn);
    })();
  }, []);

  const saveTiers = async (updated: LoyaltyTierConfig[]) => {
    setTiers(updated);
    await setStoredData(STORAGE_TIERS_KEY, updated);
  };

  const saveCheckIn = async (updated: CheckInConfig) => {
    setCheckInConfig(updated);
    await setStoredData(STORAGE_CHECKIN_KEY, updated);
  };

  const tierDistribution = useMemo(() => {
    const dist: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    customers.forEach(c => { dist[c.tier] = (dist[c.tier] || 0) + 1; });
    return dist;
  }, [customers]);

  const stats = useMemo(() => {
    const totalMembers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + c.totalPoints, 0);
    const activeStreaks = customers.filter(c => c.currentStreak > 0).length;
    const tierValues: Record<string, number> = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    const avgTierNum = totalMembers > 0 ? customers.reduce((sum, c) => sum + (tierValues[c.tier] || 1), 0) / totalMembers : 0;
    const avgTierNames = ['', 'Bronze', 'Silver', 'Gold', 'Platinum'];
    const avgTier = avgTierNames[Math.round(avgTierNum)] || 'Bronze';
    return { totalMembers, totalPoints, activeStreaks, avgTier };
  }, [customers]);

  const handleEditTier = (tier: LoyaltyTierConfig) => {
    Alert.alert(
      `Edit ${tier.name} Tier`,
      `Min Points: ${tier.minPoints}\nDiscount: ${tier.discountPercent}%\nFree Delivery: ${tier.freeDelivery ? 'Yes' : 'No'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Increase Discount', onPress: () => {
          const updated = tiers.map(t => t.tier === tier.tier ? { ...t, discountPercent: t.discountPercent + 1 } : t);
          saveTiers(updated);
          Alert.alert('Updated', `${tier.name} discount increased to ${tier.discountPercent + 1}%`);
        }},
      ]
    );
  };

  const toggleCheckIn = () => {
    const updated = { ...checkInConfig, isEnabled: !checkInConfig.isEnabled, updatedAt: new Date().toISOString() };
    saveCheckIn(updated);
  };

  const renderBenefit = (label: string, enabled: boolean) => (
    <View style={styles.benefitRow} key={label}>
      <Icon name={enabled ? 'check-circle' : 'close-circle-outline'} size={14} color={enabled ? '#2E7D32' : '#BDBDBD'} />
      <Text style={[styles.benefitText, !enabled && { color: '#BDBDBD' }]}>{label}</Text>
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
            <Text style={styles.headerTitle}>Loyalty Tiers</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="account-group" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="star-circle" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="fire" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.activeStreaks}</Text>
          <Text style={styles.statLabel}>Streaks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="trophy" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.avgTier}</Text>
          <Text style={styles.statLabel}>Avg Tier</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tier Cards */}
        <Text style={styles.sectionTitle}>Tier Configuration</Text>
        {tiers.map(tier => {
          const tierColor = TIER_COLORS[tier.tier] || '#CD7F32';
          const tierBg = TIER_BG[tier.tier] || '#FFF3E0';
          const count = tierDistribution[tier.tier] || 0;
          return (
            <TouchableOpacity key={tier.tier} style={styles.tierCard} onPress={() => handleEditTier(tier)} activeOpacity={0.7}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierIconCircle, { backgroundColor: tierBg }]}>
                  <Icon name={TIER_ICONS[tier.tier] as any || 'shield-outline'} size={22} color={tierColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierName, { color: tierColor }]}>{tier.name}</Text>
                  <Text style={styles.tierThreshold}>{tier.minPoints} points to unlock</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={[styles.tierDiscount, { color: tierColor }]}>{tier.discountPercent}%</Text>
                  <Text style={styles.tierDiscountLabel}>discount</Text>
                </View>
              </View>

              <View style={styles.benefitsSection}>
                {renderBenefit('Free Delivery', tier.freeDelivery)}
                {renderBenefit('Priority Support', tier.prioritySupport)}
                {renderBenefit('Exclusive Offers', tier.exclusiveOffers)}
              </View>

              <View style={styles.tierFooter}>
                <View style={[styles.customerCountBadge, { backgroundColor: tierBg }]}>
                  <Icon name="account" size={12} color={tierColor} />
                  <Text style={[styles.customerCountText, { color: tierColor }]}>{count} customers</Text>
                </View>
                <Icon name="pencil-outline" size={14} color={COLORS.text.muted} />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Check-In Streak Config */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Check-In Streak Config</Text>
        <View style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <View style={styles.checkInHeaderLeft}>
              <Icon name="fire" size={20} color="#E65100" />
              <Text style={styles.checkInTitle}>Daily Check-In Streaks</Text>
            </View>
            <Switch
              value={checkInConfig.isEnabled}
              onValueChange={toggleCheckIn}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={checkInConfig.isEnabled ? COLORS.primary : '#BDBDBD'}
            />
          </View>

          <View style={styles.checkInGrid}>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Daily Points</Text>
              <Text style={styles.checkInValue}>{checkInConfig.dailyPoints}</Text>
            </View>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Streak Bonus</Text>
              <Text style={styles.checkInValue}>{checkInConfig.streakBonus} pts</Text>
            </View>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Streak Days</Text>
              <Text style={styles.checkInValue}>{checkInConfig.streakDays} days</Text>
            </View>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Max Streak</Text>
              <Text style={styles.checkInValue}>{checkInConfig.maxStreak} days</Text>
            </View>
          </View>
        </View>

        {/* Tier Distribution Summary */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Customer Distribution</Text>
        <View style={styles.distCard}>
          {Object.entries(tierDistribution).map(([tier, count]) => {
            const total = customers.length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const tierColor = TIER_COLORS[tier] || '#CD7F32';
            return (
              <View key={tier} style={styles.distRow}>
                <View style={styles.distLeft}>
                  <Icon name={TIER_ICONS[tier] as any || 'shield-outline'} size={16} color={tierColor} />
                  <Text style={styles.distTierName}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
                </View>
                <View style={styles.distBarContainer}>
                  <View style={[styles.distBar, { width: `${pct}%`, backgroundColor: tierColor }]} />
                </View>
                <Text style={styles.distCount}>{count} ({pct}%)</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {customers.length === 0 && (
        <View style={styles.empty}>
          <Icon name="trophy-outline" size={64} color={COLORS.text.muted} />
          <Text style={styles.emptyTitle}>No loyalty members</Text>
          <Text style={styles.emptySub}>
            Customers will appear here once they join the loyalty program
          </Text>
        </View>
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

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.sm, marginTop: SPACING.md },

  tierCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  tierIconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  tierName: { fontSize: 16, fontWeight: '800' },
  tierThreshold: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  tierRight: { alignItems: 'center' },
  tierDiscount: { fontSize: 20, fontWeight: '800' },
  tierDiscountLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  benefitsSection: { borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm, gap: SPACING.xs },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  benefitText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },

  tierFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  customerCountBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  customerCountText: { fontSize: 11, fontWeight: '700' },

  checkInCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  checkInHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  checkInHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkInTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  checkInGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  checkInItem: { width: '47%', backgroundColor: '#F9FAFB', borderRadius: RADIUS.md, padding: SPACING.sm },
  checkInLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted, marginBottom: 3 },
  checkInValue: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },

  distCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm, gap: SPACING.md },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  distLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, width: 85 },
  distTierName: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary },
  distBarContainer: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 4 },
  distCount: { fontSize: 11, fontWeight: '700', color: COLORS.text.secondary, width: 65, textAlign: 'right' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
