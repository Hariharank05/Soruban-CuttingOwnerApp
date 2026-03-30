// app/recipes-manage.tsx - Community Recipe Moderation
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
import { useRecipes } from '@/context/RecipeContext';
import type { CommunityRecipe } from '@/types';

type FilterKey = 'all' | 'pending' | 'approved' | 'featured' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
  pending: { label: 'Pending', bg: '#FFF3E0', color: '#E65100', icon: 'clock-outline' },
  approved: { label: 'Approved', bg: '#E8F5E9', color: '#2E7D32', icon: 'check-circle' },
  featured: { label: 'Featured', bg: '#E3F2FD', color: '#1565C0', icon: 'star' },
  rejected: { label: 'Rejected', bg: '#FFEBEE', color: '#C62828', icon: 'close-circle' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'featured', label: 'Featured' },
  { key: 'rejected', label: 'Rejected' },
];

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecipesManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { recipes, updateStatus, linkToPack, deleteRecipe } = useRecipes();
  const [filter, setFilter] = useState<FilterKey>('all');

  const stats = useMemo(() => {
    const total = recipes.length;
    const pending = recipes.filter(r => r.status === 'pending').length;
    const approved = recipes.filter(r => r.status === 'approved').length;
    const featured = recipes.filter(r => r.status === 'featured').length;
    return { total, pending, approved, featured };
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (filter === 'all') return recipes;
    return recipes.filter(r => r.status === filter);
  }, [recipes, filter]);

  const handleApprove = (recipe: CommunityRecipe) => {
    Alert.alert('Approve Recipe', `Approve "${recipe.title}" by ${recipe.authorName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus(recipe.id, 'approved') },
    ]);
  };

  const handleReject = (recipe: CommunityRecipe) => {
    Alert.alert('Reject Recipe', `Reject "${recipe.title}"? The author will be notified.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus(recipe.id, 'rejected') },
    ]);
  };

  const handleFeature = (recipe: CommunityRecipe) => {
    Alert.alert('Feature Recipe', `Feature "${recipe.title}" on the homepage?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Feature', onPress: () => updateStatus(recipe.id, 'featured') },
    ]);
  };

  const handleLinkPack = (recipe: CommunityRecipe) => {
    Alert.alert('Link to Pack', 'Select a pack to link with this recipe:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sambar Pack', onPress: () => linkToPack(recipe.id, 'pk1', 'Sambar Pack') },
      { text: 'Salad Pack', onPress: () => linkToPack(recipe.id, 'pk2', 'Salad Pack') },
      { text: 'Stir Fry Pack', onPress: () => linkToPack(recipe.id, 'pk3', 'Stir Fry Pack') },
    ]);
  };

  const handleDelete = (recipe: CommunityRecipe) => {
    Alert.alert('Delete Recipe', `Permanently delete "${recipe.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(recipe.id) },
    ]);
  };

  const renderRecipeCard = ({ item }: { item: CommunityRecipe }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const isPending = item.status === 'pending';

    return (
      <View style={[styles.card, isPending && styles.cardPending]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardAuthor}>by {item.authorName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            {statusCfg.icon && <Icon name={statusCfg.icon as any} size={11} color={statusCfg.color} />}
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="clock-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.cookTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="account-group-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.servings} servings</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="heart" size={13} color="#E53935" />
            <Text style={styles.metaText}>{item.likes}</Text>
          </View>
          <View style={[styles.ingredientBadge, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.ingredientBadgeText, { color: '#1565C0' }]}>{item.ingredients.length} ingredients</Text>
          </View>
        </View>

        {item.linkedPackName && (
          <View style={[styles.packBadge, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="package-variant" size={12} color="#2E7D32" />
            <Text style={[styles.packBadgeText, { color: '#2E7D32' }]}>Linked: {item.linkedPackName}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {item.status !== 'approved' && item.status !== 'featured' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleApprove(item)}>
              <Icon name="check" size={14} color="#2E7D32" />
              <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Approve</Text>
            </TouchableOpacity>
          )}
          {item.status !== 'rejected' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]} onPress={() => handleReject(item)}>
              <Icon name="close" size={14} color="#C62828" />
              <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Reject</Text>
            </TouchableOpacity>
          )}
          {item.status === 'approved' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => handleFeature(item)}>
              <Icon name="star" size={14} color="#1565C0" />
              <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Feature</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3E5F5' }]} onPress={() => handleLinkPack(item)}>
            <Icon name="link-variant" size={14} color="#7B1FA2" />
            <Text style={[styles.actionBtnText, { color: '#7B1FA2' }]}>Pack</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F5F5F5' }]} onPress={() => handleDelete(item)}>
            <Icon name="delete-outline" size={14} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="chef-hat" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No recipes found</Text>
      <Text style={styles.emptySub}>Community recipes will appear here once customers submit them</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Moderation</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="book-open-variant" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="clock-outline" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="check-circle" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="star" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.featured}</Text>
          <Text style={styles.statLabel}>Featured</Text>
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
        data={filteredRecipes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderRecipeCard}
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

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardPending: { borderLeftWidth: 3, borderLeftColor: '#E65100' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  cardAuthor: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '800' },

  description: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 19, marginBottom: SPACING.sm },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: COLORS.text.muted },
  ingredientBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  ingredientBadgeText: { fontSize: 10, fontWeight: '700' },

  packBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.md, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  packBadgeText: { fontSize: 11, fontWeight: '700' },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
