// app/custom-packs-monitor.tsx - Custom Pack Trends Monitor
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
import type { CustomPackTrend } from '@/types';
import DEMO_TRENDS from '@/data/customPackTrends';

const MEDAL_COLORS: Record<number, { bg: string; color: string; icon: string }> = {
  1: { bg: '#FFF8E1', color: '#F57F17', icon: 'medal' },
  2: { bg: '#F5F5F5', color: '#757575', icon: 'medal' },
  3: { bg: '#FBE9E7', color: '#BF360C', icon: 'medal' },
};

function formatCurrency(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function isRecentlyUsed(dateStr: string): boolean {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

export default function CustomPacksMonitorScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [trends] = useState<CustomPackTrend[]>(DEMO_TRENDS);

  const sorted = useMemo(() =>
    [...trends].sort((a, b) => b.usageCount - a.usageCount),
    [trends]
  );

  const maxUsage = sorted.length > 0 ? sorted[0].usageCount : 1;
  const totalUsage = sorted.reduce((s, t) => s + t.usageCount, 0);
  const totalCustomers = sorted.reduce((s, t) => s + t.customerCount, 0);
  const avgOrderValue = sorted.length > 0
    ? Math.round(sorted.reduce((s, t) => s + t.avgOrderValue, 0) / sorted.length)
    : 0;
  const mostPopular = sorted.length > 0 ? sorted[0].name : '-';

  const suggestions = sorted.filter(t => t.usageCount > 50);

  const renderTrendCard = ({ item, index }: { item: CustomPackTrend; index: number }) => {
    const rank = index + 1;
    const medal = MEDAL_COLORS[rank];
    const barWidth = `${(item.usageCount / maxUsage) * 100}%`;
    const trending = isRecentlyUsed(item.lastUsed);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {medal ? (
            <View style={[styles.rankBadge, { backgroundColor: medal.bg, borderColor: medal.color }]}>
              <Icon name={medal.icon as any} size={16} color={medal.color} />
            </View>
          ) : (
            <View style={[styles.rankBadge, { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' }]}>
              <Text style={styles.rankNumber}>#{rank}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <View style={styles.nameRow}>
              <Text style={styles.packName}>{item.name}</Text>
              {trending && (
                <View style={styles.trendingBadge}>
                  <Icon name="trending-up" size={12} color="#2E7D32" />
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              )}
            </View>
            {/* Items as chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {item.items.map((itm, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{itm}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Usage bar */}
        <View style={styles.usageSection}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageLabel}>Usage</Text>
            <Text style={styles.usageValue}>{item.usageCount} times</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: barWidth as any }]} />
          </View>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="account-group-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.customerCount} customers</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="currency-inr" size={13} color={COLORS.text.muted} />
            <Text style={styles.metaText}>Avg {formatCurrency(item.avgOrderValue)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="calendar-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{formatDate(item.lastUsed)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="package-variant-closed" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No custom packs yet</Text>
      <Text style={styles.emptySub}>Custom pack trends will appear here as customers create combinations</Text>
    </View>
  );

  const ListFooter = () => (
    <>
      {suggestions.length > 0 && (
        <View style={styles.suggestSection}>
          <View style={styles.suggestHeader}>
            <Icon name="lightbulb-on-outline" size={20} color="#F57F17" />
            <Text style={styles.suggestTitle}>Pack Suggestions</Text>
          </View>
          <Text style={styles.suggestSubtitle}>
            These custom combinations have high usage. Consider creating official packs.
          </Text>
          {suggestions.map(s => (
            <View key={s.id} style={styles.suggestCard}>
              <View style={styles.suggestCardHeader}>
                <Icon name="auto-fix" size={18} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Text style={styles.suggestPackName}>{s.name}</Text>
                  <Text style={styles.suggestPackInfo}>
                    {s.usageCount} uses by {s.customerCount} customers
                  </Text>
                </View>
                <TouchableOpacity style={styles.suggestBtn}>
                  <Text style={styles.suggestBtnText}>Create Pack</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.suggestItems}>
                {s.items.map((itm, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.chipText, { color: '#2E7D32' }]}>{itm}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: SPACING.xxxl }} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Custom Packs & Trends</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="package-variant" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{sorted.length}</Text>
          <Text style={styles.statLabel}>Packs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="chart-bar" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{totalUsage}</Text>
          <Text style={styles.statLabel}>Total Usage</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="trophy" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]} numberOfLines={1}>{mostPopular.split(' ')[0]}</Text>
          <Text style={styles.statLabel}>Top Pack</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="currency-inr" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{formatCurrency(avgOrderValue)}</Text>
          <Text style={styles.statLabel}>Avg Value</Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={ListFooter}
        renderItem={renderTrendCard}
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

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  rankBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankNumber: { fontSize: 12, fontWeight: '800', color: '#757575' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  packName: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#E8F5E9', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  trendingText: { fontSize: 9, fontWeight: '700', color: '#2E7D32' },

  chipsScroll: { marginTop: SPACING.xs },
  chipsRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' },
  chip: { backgroundColor: '#F5F5F5', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  chipText: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary },

  usageSection: { marginTop: SPACING.md },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  usageLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.muted },
  usageValue: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  barTrack: { height: 10, backgroundColor: '#F5F5F5', borderRadius: RADIUS.sm, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.sm },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginTop: SPACING.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: COLORS.text.muted },

  suggestSection: { marginTop: SPACING.lg },
  suggestHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  suggestTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  suggestSubtitle: { fontSize: 12, color: COLORS.text.muted, marginBottom: SPACING.md },
  suggestCard: { backgroundColor: '#FFFDE7', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, borderWidth: 1, borderColor: '#FFF9C4' },
  suggestCardHeader: { flexDirection: 'row', alignItems: 'center' },
  suggestPackName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  suggestPackInfo: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  suggestBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  suggestBtnText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  suggestItems: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.sm },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
