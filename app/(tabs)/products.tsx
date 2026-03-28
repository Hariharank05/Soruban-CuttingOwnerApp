import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, TextInput, Image, Switch, Alert, Animated,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import { useTabBar } from '@/context/TabBarContext';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'fruits', label: 'Fruits' },
  { key: 'salad_packs', label: 'Salad Packs' },
  { key: 'healthy_drinks', label: 'Healthy Drinks' },
  { key: 'dish_packs', label: 'Dish Packs' },
];

export default function ProductsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { products, toggleStock } = useProducts();
  const { handleScroll } = useTabBar();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bulkMode, setBulkMode] = useState(false);
  const { translateY } = useTabBar();

  const toggleBulkMode = () => {
    const next = !bulkMode;
    setBulkMode(next);
    Animated.spring(translateY, {
      toValue: next ? 100 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category?.toLowerCase().replace(/\s+/g, '_') === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, search]);

  const outOfStockCount = useMemo(() => filteredProducts.filter(p => p.inStock !== false).length, [filteredProducts]);
  const inStockCount = useMemo(() => filteredProducts.filter(p => p.inStock === false).length, [filteredProducts]);
  const activeCategoryLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || 'All';

  const handleBulkOutOfStock = () => {
    const affected = filteredProducts.filter(p => p.inStock !== false);
    if (affected.length === 0) return;
    const names = affected.slice(0, 5).map(p => p.name).join(', ');
    const more = affected.length > 5 ? ` and ${affected.length - 5} more` : '';
    Alert.alert(
      'Mark Out of Stock',
      `Category: ${activeCategoryLabel}\n\n${affected.length} product${affected.length !== 1 ? 's' : ''} will be marked out of stock:\n\n${names}${more}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: () => affected.forEach(p => toggleStock?.(p.id)) },
      ],
    );
  };

  const handleBulkInStock = () => {
    const affected = filteredProducts.filter(p => p.inStock === false);
    if (affected.length === 0) return;
    const names = affected.slice(0, 5).map(p => p.name).join(', ');
    const more = affected.length > 5 ? ` and ${affected.length - 5} more` : '';
    Alert.alert(
      'Mark In Stock',
      `Category: ${activeCategoryLabel}\n\n${affected.length} product${affected.length !== 1 ? 's' : ''} will be marked in stock:\n\n${names}${more}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => affected.forEach(p => toggleStock?.(p.id)) },
      ],
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const inStock = item.inStock !== false;
    return (
      <View style={[styles.productCard, themed.card]}>
        <View style={styles.productRow}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/60' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <View style={styles.productNameRow}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push({ pathname: '/product-form', params: { id: item.id } })}
              >
                <Icon name="pencil-outline" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.productPrice}>{'\u20B9'}{item.price}/{item.unit || 'kg'}</Text>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
              )}
            </View>

            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: inStock ? '#4CAF50' : '#E53935' }]} />
              <Text style={[styles.stockText, { color: inStock ? '#388E3C' : '#C62828' }]}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
              <Switch
                value={inStock}
                onValueChange={() => toggleStock?.(item.id)}
                trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                thumbColor={inStock ? '#4CAF50' : '#BDBDBD'}
                style={styles.stockSwitch}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Products</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.bulkBtn, bulkMode && styles.bulkBtnActive]}
              onPress={toggleBulkMode}
            >
              <Icon name={bulkMode ? 'check-bold' : 'checkbox-multiple-outline'} size={18} color="#FFF" />
              <Text style={styles.bulkBtnText}>Bulk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createPackBtn}
              onPress={() => router.push('/pack-form' as any)}
            >
              <Icon name="package-variant" size={18} color="#FFF" />
              <Text style={styles.createPackText}>Pack</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/product-form' as any)}
            >
              <Icon name="plus" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: themed.colors.card }]}>
          <Icon name="magnify" size={20} color={COLORS.text.muted} />
          <TextInput
            style={[styles.searchInput, { color: themed.colors.text.primary }]}
            placeholder="Search products..."
            placeholderTextColor={COLORS.text.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterWrap}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={c => c.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: themed.colors.card }, activeCategory === c.key && styles.filterChipActive]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text style={[styles.filterChipText, activeCategory === c.key && styles.filterChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={[styles.list, bulkMode && { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={56} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Try a different search term' : 'Add your first product to get started'}
            </Text>
            {!search && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/product-form' as any)}>
                <Icon name="plus" size={18} color="#FFF" />
                <Text style={styles.emptyBtnText}>Add Product</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {bulkMode && (
        <View style={styles.bulkBar}>
          <TouchableOpacity style={styles.bulkBarBtnDanger} onPress={handleBulkOutOfStock}>
            <Icon name="close-circle-outline" size={20} color="#FFF" />
            <Text style={styles.bulkBarBtnText}>Out of Stock ({outOfStockCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkBarBtnSuccess} onPress={handleBulkInStock}>
            <Icon name="check-circle-outline" size={20} color="#FFF" />
            <Text style={styles.bulkBarBtnText}>In Stock ({inStockCount})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  createPackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, ...SHADOW.sm,
  },
  createPackText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  addButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOW.sm,
  },

  /* Search */
  searchWrap: { paddingHorizontal: SPACING.base, marginTop: SPACING.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14, paddingVertical: 10, ...SHADOW.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text.primary, paddingVertical: 0 },

  /* Category Filters */
  categoryFilterWrap: { flexGrow: 0, flexShrink: 0 },
  categoryList: { paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingVertical: SPACING.md, alignItems: 'center' },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  filterChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  filterChipTextActive: { color: COLORS.primary },

  /* Count */
  countRow: { paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  countText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },

  /* Product List */
  list: { paddingHorizontal: SPACING.base, paddingBottom: 100 },

  /* Product Card */
  productCard: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  productRow: { flexDirection: 'row', gap: SPACING.md },
  productImage: { width: 64, height: 64, borderRadius: RADIUS.md },
  productInfo: { flex: 1 },
  productNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, flex: 1, marginRight: 8 },
  editBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundSoft,
    justifyContent: 'center', alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  productPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  categoryBadge: {
    backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.green },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 12, fontWeight: '600', flex: 1 },
  stockSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },

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

  /* Bulk Mode */
  bulkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.text.secondary, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, ...SHADOW.sm,
  },
  bulkBtnActive: { backgroundColor: '#388E3C' },
  bulkBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bulkBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.lg,
  },
  bulkBarBtnDanger: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#C62828', borderRadius: RADIUS.lg, paddingVertical: 12, paddingHorizontal: SPACING.sm,
  },
  bulkBarBtnSuccess: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#388E3C', borderRadius: RADIUS.lg, paddingVertical: 12, paddingHorizontal: SPACING.sm,
  },
  bulkBarBtnText: { fontSize: 11, fontWeight: '700', color: '#FFF', textAlign: 'center' },
});
