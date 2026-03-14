import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useProducts } from '@/context/ProductContext';
import type { Product } from '@/types';

const UNIT_OPTIONS = ['kg', 'g', '500g', '250g', '100g', 'pack', 'bottle', 'bunch', '300ml', '500ml', '1 kg'];
const CATEGORY_OPTIONS: { key: Product['category']; label: string; icon: string }[] = [
  { key: 'vegetables', label: 'Vegetables', icon: 'leaf' },
  { key: 'fruits', label: 'Fruits', icon: 'fruit-watermelon' },
  { key: 'salad_packs', label: 'Salad Packs', icon: 'food-variant' },
  { key: 'healthy_drinks', label: 'Healthy Drinks', icon: 'cup' },
  { key: 'dish_packs', label: 'Dish Packs', icon: 'food' },
];

export default function ProductFormScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const isEditing = Boolean(id);
  const existingProduct = useMemo(() => (id ? products.find(p => p.id === id) : undefined), [id, products]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState<Product['category']>('vegetables');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description || '');
      setPrice(String(existingProduct.price));
      setUnit(existingProduct.unit);
      setCategory(existingProduct.category);
      setImageUrl(existingProduct.image || '');
      setTags(existingProduct.tags?.join(', ') || '');
      setInStock(existingProduct.inStock);
      setStockQuantity(String(existingProduct.stockQuantity || ''));
    }
  }, [existingProduct]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Product name is required'); return; }
    if (!price.trim() || isNaN(Number(price))) { Alert.alert('Validation', 'Please enter a valid price'); return; }

    const productData: Product = {
      id: isEditing ? id! : `p_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      unit,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
      category,
      inStock,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: existingProduct?.createdAt || new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateProduct(id!, productData);
        Alert.alert('Success', 'Product updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await addProduct(productData);
        Alert.alert('Success', 'Product added successfully', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to save product');
    }
  }, [name, description, price, unit, category, imageUrl, tags, inStock, stockQuantity, isEditing, id, existingProduct, addProduct, updateProduct, router]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteProduct(id!);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  }, [name, id, deleteProduct, router]);

  const selectedCategoryLabel = CATEGORY_OPTIONS.find(c => c.key === category)?.label || 'Select';

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Product Name */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Product Name *</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Fresh Tomatoes"
              placeholderTextColor={COLORS.text.muted}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, themed.inputBg]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the product..."
              placeholderTextColor={COLORS.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Price & Unit Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>Price ({'\u20B9'}) *</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>Unit</Text>
              <TouchableOpacity
                style={[styles.input, styles.pickerBtn, themed.inputBg]}
                onPress={() => { setShowUnitPicker(!showUnitPicker); setShowCategoryPicker(false); }}
              >
                <Text style={[styles.pickerText, themed.textPrimary]}>{unit}</Text>
                <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unit Picker */}
          {showUnitPicker && (
            <View style={[styles.pickerDropdown, themed.card]}>
              {UNIT_OPTIONS.map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.pickerOption, unit === u && styles.pickerOptionActive]}
                  onPress={() => { setUnit(u); setShowUnitPicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, unit === u && styles.pickerOptionTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Category</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn, themed.inputBg]}
              onPress={() => { setShowCategoryPicker(!showCategoryPicker); setShowUnitPicker(false); }}
            >
              <Text style={[styles.pickerText, themed.textPrimary]}>{selectedCategoryLabel}</Text>
              <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Category Picker */}
          {showCategoryPicker && (
            <View style={[styles.pickerDropdown, themed.card]}>
              {CATEGORY_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.pickerOption, category === c.key && styles.pickerOptionActive]}
                  onPress={() => { setCategory(c.key); setShowCategoryPicker(false); }}
                >
                  <Icon name={c.icon as any} size={18} color={category === c.key ? COLORS.primary : COLORS.text.secondary} />
                  <Text style={[styles.pickerOptionText, category === c.key && styles.pickerOptionTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Image URL */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Image URL</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={COLORS.text.muted}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Tags</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={tags}
              onChangeText={setTags}
              placeholder="fresh, organic, popular (comma separated)"
              placeholderTextColor={COLORS.text.muted}
            />
          </View>

          {/* In Stock Toggle */}
          <View style={[styles.card, themed.card]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, themed.textPrimary]}>In Stock</Text>
                <Text style={[styles.toggleDesc, themed.textSecondary]}>
                  Toggle product availability for customers
                </Text>
              </View>
              <Switch
                value={inStock}
                onValueChange={setInStock}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={inStock ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Stock Quantity */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Stock Quantity</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={stockQuantity}
              onChangeText={setStockQuantity}
              placeholder="0"
              placeholderTextColor={COLORS.text.muted}
              keyboardType="numeric"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.saveBtnGradient}>
              <Icon name="content-save" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>{isEditing ? 'Update Product' : 'Add Product'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Button */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
              <Icon name="delete-outline" size={20} color={COLORS.status.error} />
              <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  field: { marginBottom: SPACING.base },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 15,
  },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: SPACING.md },

  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: 15, fontWeight: '500' },
  pickerDropdown: {
    borderRadius: RADIUS.lg, padding: SPACING.sm,
    marginBottom: SPACING.base, marginTop: -SPACING.sm, ...SHADOW.md,
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs,
  },
  pickerOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickerOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  pickerOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  pickerOptionTextActive: { color: COLORS.primary },

  card: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontWeight: '700' },
  toggleDesc: { fontSize: 12, marginTop: 2 },

  saveBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.status.error,
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.status.error },
});
