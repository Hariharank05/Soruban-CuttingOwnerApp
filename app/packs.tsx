import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, Image, Switch,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { usePacks } from '@/context/PackContext';
import type { Pack, PackCategory } from '@/types';

const CATEGORIES: { key: PackCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'package-variant' },
  { key: 'dish_pack', label: 'Dish Packs', icon: 'food' },
  { key: 'salad_pack', label: 'Salad Packs', icon: 'food-variant' },
  { key: 'fruit_pack', label: 'Fruit Packs', icon: 'fruit-watermelon' },
  { key: 'juice_pack', label: 'Juice Packs', icon: 'cup' },
  { key: 'festival_pack', label: 'Festival', icon: 'party-popper' },
];

const getCategoryColors = (themed: any): Record<string, { color: string; bg: string }> => ({
  dish_pack: { color: '#E65100', bg: themed.colors.accentBg.orange },
  salad_pack: { color: '#388E3C', bg: themed.colors.accentBg.green },
  fruit_pack: { color: '#7B1FA2', bg: themed.colors.accentBg.purple },
  juice_pack: { color: '#1565C0', bg: themed.colors.accentBg.blue },
  festival_pack: { color: '#C62828', bg: themed.colors.accentBg.red },
});

export default function PacksScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { packs, toggleAvailability } = usePacks();
  const [activeCategory, setActiveCategory] = useState<PackCategory | 'all'>('all');
  const CATEGORY_COLORS = useMemo(() => getCategoryColors(themed), [themed]);

  const stats = useMemo(() => {
    const total = packs.length;
    const available = packs.filter(p => p.isAvailable).length;
    const dishPacks = packs.filter(p => p.category === 'dish_pack').length;
    return { total, available, dishPacks };
  }, [packs]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return packs;
    return packs.filter(p => p.category === activeCategory);
  }, [packs, activeCategory]);

  const getCategoryLabel = (cat: PackCategory) => {
    return CATEGORIES.find(c => c.key === cat)?.label || cat;
  };

  const renderPack = ({ item }: { item: Pack }) => {
    const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.dish_pack;

    return (
      <TouchableOpacity
        style={[styles.packCard, themed.card]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/pack-form', params: { id: item.id } } as any)}
      >
        {/* Image & Tag */}
        <View style={styles.packImageWrap}>
          <Image
            source={{ uri: item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' }}
            style={styles.packImage}
            resizeMode="cover"
          />
          {item.tag && (
            <View style={[styles.tagBadge, { backgroundColor: catStyle.color }]}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.packInfo}>
          <View style={styles.packNameRow}>
            <Text style={styles.packName} numberOfLines={1}>{item.name}</Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => toggleAvailability?.(item.id)}
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={item.isAvailable ? '#4CAF50' : '#BDBDBD'}
              style={styles.stockSwitch}
            />
          </View>

          <Text style={styles.packDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.packMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.categoryText, { color: catStyle.color }]}>
                {getCategoryLabel(item.category)}
              </Text>
            </View>
            <View style={styles.servesRow}>
              <Icon name="account-group-outline" size={13} color={COLORS.text.muted} />
              <Text style={styles.servesText}>{item.serves}</Text>
            </View>
          </View>

          {/* Items preview */}
          <View style={styles.ingredientRow}>
            <Icon name="food-apple-outline" size={13} color={COLORS.text.secondary} />
            <Text style={styles.ingredientText} numberOfLines={1}>
              {item.items.slice(0, 4).map(i => i.name).join(', ')}
              {item.items.length > 4 ? ` +${item.items.length - 4} more` : ''}
            </Text>
          </View>

          {/* Bottom row */}
          <View style={styles.packBottomRow}>
            <Text style={styles.packPrice}>{'\u20B9'}{item.price}</Text>
            <View style={[styles.availBadge, { backgroundColor: item.isAvailable ? themed.colors.accentBg.green : themed.colors.accentBg.red }]}>
              <View style={[styles.availDot, { backgroundColor: item.isAvailable ? '#4CAF50' : '#E53935' }]} />
              <Text style={[styles.availText, { color: item.isAvailable ? '#388E3C' : '#C62828' }]}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Packs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/pack-form' as any)}
          >
            <Icon name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.green }]}>
          <Text style={[styles.statCount, { color: '#388E3C' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.blue }]}>
          <Text style={[styles.statCount, { color: '#1565C0' }]}>{stats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themed.colors.accentBg.orange }]}>
          <Text style={[styles.statCount, { color: '#E65100' }]}>{stats.dishPacks}</Text>
          <Text style={styles.statLabel}>Dish Packs</Text>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeCategory === c.key && styles.filterChipActive]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Icon
                name={c.icon as any}
                size={14}
                color={activeCategory === c.key ? COLORS.primary : COLORS.text.secondary}
              />
              <Text style={[styles.filterChipText, activeCategory === c.key && styles.filterChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} pack{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Pack List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPack}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No packs found</Text>
            <Text style={styles.emptyDesc}>
              {activeCategory === 'all'
                ? 'Create your first pack to get started'
                : `No ${getCategoryLabel(activeCategory as PackCategory).toLowerCase()} found`}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/pack-form' as any)}>
              <Icon name="plus" size={18} color="#FFF" />
              <Text style={styles.emptyBtnText}>Create Pack</Text>
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

  /* Filters */
  filterWrap: { flexGrow: 0, flexShrink: 0 },
  filterList: { paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingVertical: SPACING.md, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  filterChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary },
  filterChipTextActive: { color: COLORS.primary },

  /* Count */
  countRow: { paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  countText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },

  /* List */
  list: { paddingHorizontal: SPACING.base, paddingBottom: 100 },

  /* Pack Card */
  packCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden', ...SHADOW.sm,
  },
  packImageWrap: { position: 'relative' },
  packImage: { width: '100%', height: 140, backgroundColor: '#F0F0F0' },
  tagBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#FFF' },

  packInfo: { padding: SPACING.base },
  packNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packName: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, flex: 1, marginRight: 8 },
  stockSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },

  packDesc: { fontSize: 12, color: COLORS.text.secondary, marginTop: 4, lineHeight: 17 },

  packMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  categoryText: { fontSize: 11, fontWeight: '700' },
  servesRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  servesText: { fontSize: 11, color: COLORS.text.muted },

  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: SPACING.sm },
  ingredientText: { fontSize: 12, color: COLORS.text.secondary, flex: 1 },

  packBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  packPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  availDot: { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 11, fontWeight: '700' },

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
