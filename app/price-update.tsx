// app/price-update.tsx - Quick Price Update Screen
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '@/src/utils/theme';
import { useProducts } from '@/context/ProductContext';
import type { Product } from '@/types';

export default function PriceUpdateScreen() {
  const router = useRouter();
  const { products, updateProduct } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});
  const [updatedCount, setUpdatedCount] = useState(0);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const handlePriceChange = (productId: string, value: string) => {
    setEditedPrices((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSavePrice = (product: Product) => {
    const newPriceStr = editedPrices[product.id];
    if (!newPriceStr || isNaN(Number(newPriceStr))) return;

    const newPrice = Number(newPriceStr);
    if (newPrice === product.price) return;

    updateProduct(product.id, { price: newPrice });
    setEditedPrices((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    setUpdatedCount((prev) => prev + 1);
  };

  const isPriceChanged = (product: Product): boolean => {
    const edited = editedPrices[product.id];
    if (!edited) return false;
    if (isNaN(Number(edited))) return false;
    return Number(edited) !== product.price;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const changed = isPriceChanged(item);
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Image source={{ uri: item.image }} style={styles.rowImage} />
          <View style={styles.rowInfo}>
            <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rowCurrent}>
              Current: {'\u20B9'}{item.price}
            </Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <View style={styles.priceInputWrap}>
            <Text style={styles.pricePrefix}>{'\u20B9'}</Text>
            <TextInput
              style={styles.priceInput}
              placeholder={String(item.price)}
              placeholderTextColor={COLORS.text.muted}
              value={editedPrices[item.id] ?? ''}
              onChangeText={(val) => handlePriceChange(item.id, val)}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
          {changed && (
            <TouchableOpacity
              style={styles.checkBtn}
              onPress={() => handleSavePrice(item)}
              activeOpacity={0.7}
            >
              <Icon name="check" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quick Price Update</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={COLORS.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Icon name="close-circle" size={18} color={COLORS.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="tag-off-outline" size={64} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>Try adjusting your search</Text>
          </View>
        }
      />

      {/* Summary Footer */}
      {updatedCount > 0 && (
        <View style={styles.summaryBar}>
          <Icon name="check-circle" size={20} color={COLORS.primary} />
          <Text style={styles.summaryText}>
            {updatedCount} price{updatedCount !== 1 ? 's' : ''} updated this session
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    ...FONTS.extraBold,
    color: COLORS.text.primary,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    paddingVertical: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.base,
    paddingBottom: 80,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  rowImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    ...FONTS.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  rowCurrent: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 90,
  },
  pricePrefix: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.text.primary,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    ...FONTS.semiBold,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
    textAlign: 'right',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    ...FONTS.extraBold,
    color: COLORS.text.primary,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
  },

  // Summary Footer
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    ...SHADOW.floating,
  },
  summaryText: {
    fontSize: 14,
    ...FONTS.semiBold,
    color: COLORS.text.primary,
  },
});
