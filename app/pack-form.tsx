import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, KeyboardAvoidingView, Platform, Image,
  Pressable, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { usePacks } from '@/context/PackContext';
import { useProducts } from '@/context/ProductContext';
import type { Pack, PackItem, PackCategory, RegionalVariant } from '@/types';

const PACK_CATEGORIES: { key: PackCategory; label: string; icon: string; color: string }[] = [
  { key: 'dish_pack', label: 'Dish Pack', icon: 'food', color: '#E65100' },
  { key: 'salad_pack', label: 'Salad Pack', icon: 'food-variant', color: '#388E3C' },
  { key: 'fruit_pack', label: 'Fruit Pack', icon: 'fruit-watermelon', color: '#7B1FA2' },
  { key: 'juice_pack', label: 'Juice Pack', icon: 'cup', color: '#1565C0' },
  { key: 'festival_pack', label: 'Festival Pack', icon: 'party-popper', color: '#C62828' },
];

const UNIT_OPTIONS = ['pc', 'kg', 'g', '250g', '500g', 'bunch', 'sprig', 'slice', 'cup'];

const COLOR_OPTIONS = [
  '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', '#FCE4EC',
  '#FFF8E1', '#E8EAF6', '#F1F8E9', '#E0F2F1', '#FFEBEE',
];

export default function PackFormScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { packs, addPack, updatePack, deletePack } = usePacks();
  const { products } = useProducts();

  const isEditing = Boolean(id);
  const existingPack = useMemo(() => (id ? packs.find(p => p.id === id) : undefined), [id, packs]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [serves, setServes] = useState('');
  const [category, setCategory] = useState<PackCategory>('dish_pack');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#E8F5E9');
  const [tag, setTag] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [cookingVideoUrl, setCookingVideoUrl] = useState('');

  // Items (ingredients)
  const [items, setItems] = useState<PackItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pc');
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Preparation steps
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');

  // Regional variants
  const [variants, setVariants] = useState<RegionalVariant[]>([]);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [variantName, setVariantName] = useState('');
  const [variantDesc, setVariantDesc] = useState('');
  const [variantSpice, setVariantSpice] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [variantIngredients, setVariantIngredients] = useState('');

  // Pickers
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Load existing pack data
  useEffect(() => {
    if (existingPack) {
      setName(existingPack.name);
      setDescription(existingPack.description || '');
      setPrice(String(existingPack.price));
      setServes(existingPack.serves || '');
      setCategory(existingPack.category);
      setImageUrl(existingPack.image || '');
      setColor(existingPack.color || '#E8F5E9');
      setTag(existingPack.tag || '');
      setIsAvailable(existingPack.isAvailable);
      setCookingVideoUrl(existingPack.cookingVideoUrl || '');
      setItems(existingPack.items || []);
      setSteps(existingPack.preparationSteps || []);
      setVariants(existingPack.regionalVariants || []);
    }
  }, [existingPack]);

  // Add ingredient from product list
  const addProductAsItem = useCallback((product: { id: string; name: string; unit: string }) => {
    const newItem: PackItem = {
      id: `pi_${Date.now()}`,
      name: product.name,
      quantity: 1,
      unit: product.unit === 'kg' || product.unit === '1 kg' ? 'pc' : product.unit,
      productId: product.id,
    };
    setItems(prev => [...prev, newItem]);
    setShowProductPicker(false);
  }, []);

  // Add custom ingredient
  const addCustomItem = useCallback(() => {
    if (!newItemName.trim()) return;
    const newItem: PackItem = {
      id: `pi_${Date.now()}`,
      name: newItemName.trim(),
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit,
    };
    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQty('1');
    setNewItemUnit('pc');
    setShowAddItem(false);
  }, [newItemName, newItemQty, newItemUnit]);

  // Remove ingredient
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  // Update item quantity
  const updateItemQty = useCallback((itemId: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const newQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: newQty };
    }));
  }, []);

  // Add preparation step
  const addStep = useCallback(() => {
    if (!newStep.trim()) return;
    setSteps(prev => [...prev, newStep.trim()]);
    setNewStep('');
  }, [newStep]);

  // Remove step
  const removeStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Add variant
  const addVariant = useCallback(() => {
    if (!variantName.trim()) return;
    const newV: RegionalVariant = {
      id: `var_${Date.now()}`,
      name: variantName.trim(),
      description: variantDesc.trim(),
      spiceLevel: variantSpice,
      extraIngredients: variantIngredients.split(',').map(s => s.trim()).filter(Boolean),
    };
    setVariants(prev => [...prev, newV]);
    setVariantName('');
    setVariantDesc('');
    setVariantSpice('medium');
    setVariantIngredients('');
    setShowAddVariant(false);
  }, [variantName, variantDesc, variantSpice, variantIngredients]);

  // Remove variant
  const removeVariant = useCallback((varId: string) => {
    setVariants(prev => prev.filter(v => v.id !== varId));
  }, []);

  // Save
  const handleSave = useCallback(async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Pack name is required'); return; }
    if (!price.trim() || isNaN(Number(price))) { Alert.alert('Validation', 'Please enter a valid price'); return; }
    if (items.length === 0) { Alert.alert('Validation', 'Add at least one ingredient'); return; }

    const packData: Pack = {
      id: isEditing ? id! : `pack_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
      category,
      price: Number(price),
      serves: serves.trim() || '2-3 people',
      color,
      tag: tag.trim() || undefined,
      items,
      preparationSteps: steps.length > 0 ? steps : undefined,
      cookingVideoUrl: cookingVideoUrl.trim() || undefined,
      regionalVariants: variants.length > 0 ? variants : undefined,
      isAvailable,
      createdAt: existingPack?.createdAt || new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updatePack(id!, packData);
        Alert.alert('Success', 'Pack updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await addPack(packData);
        Alert.alert('Success', 'Pack created successfully', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to save pack');
    }
  }, [name, description, price, serves, category, imageUrl, color, tag, items, steps, cookingVideoUrl, variants, isAvailable, isEditing, id, existingPack, addPack, updatePack, router]);

  // Delete
  const handleDelete = useCallback(() => {
    Alert.alert('Delete Pack', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deletePack(id!);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete pack');
          }
        },
      },
    ]);
  }, [name, id, deletePack, router]);

  const selectedCategoryLabel = PACK_CATEGORIES.find(c => c.key === category)?.label || 'Select';

  const isAnyPickerOpen = showCategoryPicker || showColorPicker || showUnitPicker;

  const dismissAllPickers = useCallback(() => {
    setShowCategoryPicker(false);
    setShowColorPicker(false);
    setShowUnitPicker(false);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>
            {isEditing ? 'Edit Pack' : 'Create Pack'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} onScrollBeginDrag={dismissAllPickers} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Pressable onPress={() => { if (isAnyPickerOpen) { dismissAllPickers(); } Keyboard.dismiss(); }}>

          {/* Preview Card */}
          {imageUrl.trim() ? (
            <View style={[styles.previewCard, { backgroundColor: color }]}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewName}>{name || 'Pack Name'}</Text>
                {tag ? <Text style={styles.previewTag}>{tag}</Text> : null}
              </View>
            </View>
          ) : null}

          {/* Pack Name */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Pack Name *</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sambar Pack"
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
              placeholder="Describe the pack contents..."
              placeholderTextColor={COLORS.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Price & Serves Row */}
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
              <Text style={[styles.label, themed.textPrimary]}>Serves</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={serves}
                onChangeText={setServes}
                placeholder="e.g. 4-5 people"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Category</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn, themed.inputBg]}
              onPress={() => { setShowCategoryPicker(!showCategoryPicker); setShowColorPicker(false); }}
            >
              <Text style={[styles.pickerText, themed.textPrimary]}>{selectedCategoryLabel}</Text>
              <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {showCategoryPicker && (
            <View style={[styles.pickerDropdown, themed.card]}>
              {PACK_CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.pickerOption, category === c.key && styles.pickerOptionActive]}
                  onPress={() => { setCategory(c.key); setShowCategoryPicker(false); }}
                >
                  <Icon name={c.icon as any} size={18} color={category === c.key ? c.color : COLORS.text.secondary} />
                  <Text style={[styles.pickerOptionText, category === c.key && { color: c.color }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tag */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Tag (optional)</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={tag}
              onChangeText={setTag}
              placeholder="e.g. Popular, Best Seller, Festival"
              placeholderTextColor={COLORS.text.muted}
            />
          </View>

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

          {/* Color Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Card Color</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn, themed.inputBg]}
              onPress={() => { setShowColorPicker(!showColorPicker); setShowCategoryPicker(false); }}
            >
              <View style={styles.colorPreviewRow}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={[styles.pickerText, themed.textPrimary]}>{color}</Text>
              </View>
              <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {showColorPicker && (
            <View style={[styles.pickerDropdown, themed.card]}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorOption, color === c && styles.colorOptionActive]}
                  onPress={() => { setColor(c); setShowColorPicker(false); }}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: c }]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ═══ INGREDIENTS SECTION ═══ */}
          <View style={styles.sectionHeader}>
            <Icon name="food-apple-outline" size={20} color={COLORS.text.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Ingredients *</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{items.length}</Text>
            </View>
          </View>

          {/* Current items */}
          {items.map(item => (
            <View key={item.id} style={[styles.itemCard, themed.card]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQty(item.id, -1)}>
                  <Icon name="minus" size={16} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQty(item.id, 1)}>
                  <Icon name="plus" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                <Icon name="close-circle" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add from products */}
          <View style={styles.addItemRow}>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => { setShowProductPicker(!showProductPicker); setShowAddItem(false); }}
            >
              <Icon name="plus-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.addItemBtnText}>From Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => { setShowAddItem(!showAddItem); setShowProductPicker(false); }}
            >
              <Icon name="pencil-plus-outline" size={16} color={COLORS.primary} />
              <Text style={styles.addItemBtnText}>Custom Item</Text>
            </TouchableOpacity>
          </View>

          {/* Product picker */}
          {showProductPicker && (
            <View style={[styles.productPickerWrap, themed.card]}>
              <View style={styles.inlineFormHeader}>
                <Text style={styles.pickerLabel}>Select a product to add:</Text>
                <TouchableOpacity onPress={() => setShowProductPicker(false)} style={styles.inlineFormClose}>
                  <Icon name="close" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.productPickerScroll} nestedScrollEnabled>
                {products
                  .filter(p => !items.some(i => i.productId === p.id))
                  .map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.productPickerItem}
                      onPress={() => addProductAsItem(p)}
                    >
                      <Image source={{ uri: p.image }} style={styles.productPickerImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productPickerName}>{p.name}</Text>
                        <Text style={styles.productPickerMeta}>{p.category} · {'\u20B9'}{p.price}/{p.unit}</Text>
                      </View>
                      <Icon name="plus-circle" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Custom item form */}
          {showAddItem && (
            <View style={[styles.customItemForm, themed.card]}>
              <View style={styles.inlineFormHeader}>
                <Text style={styles.inlineFormTitle}>Custom Item</Text>
                <TouchableOpacity onPress={() => setShowAddItem(false)} style={styles.inlineFormClose}>
                  <Icon name="close" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, themed.inputBg, { marginBottom: SPACING.sm }]}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Ingredient name"
                placeholderTextColor={COLORS.text.muted}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, themed.inputBg, { flex: 1 }]}
                  value={newItemQty}
                  onChangeText={setNewItemQty}
                  placeholder="Qty"
                  placeholderTextColor={COLORS.text.muted}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.input, styles.pickerBtn, themed.inputBg, { flex: 1 }]}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text style={[styles.pickerText, themed.textPrimary]}>{newItemUnit}</Text>
                  <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
              {showUnitPicker && (
                <View style={[styles.pickerDropdown, themed.card, { marginTop: SPACING.sm }]}>
                  {UNIT_OPTIONS.map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.pickerOption, newItemUnit === u && styles.pickerOptionActive]}
                      onPress={() => { setNewItemUnit(u); setShowUnitPicker(false); }}
                    >
                      <Text style={[styles.pickerOptionText, newItemUnit === u && styles.pickerOptionTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.confirmAddBtn} onPress={addCustomItem}>
                <Icon name="check" size={16} color="#FFF" />
                <Text style={styles.confirmAddBtnText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══ PREPARATION STEPS SECTION ═══ */}
          <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
            <Icon name="format-list-numbered" size={20} color={COLORS.text.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Preparation Steps</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{steps.length}</Text>
            </View>
          </View>

          {steps.map((step, idx) => (
            <View key={idx} style={[styles.stepCard, themed.card]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
              <TouchableOpacity onPress={() => removeStep(idx)} style={styles.removeBtn}>
                <Icon name="close-circle" size={18} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addStepRow}>
            <TextInput
              style={[styles.input, themed.inputBg, { flex: 1 }]}
              value={newStep}
              onChangeText={setNewStep}
              placeholder="Add a preparation step..."
              placeholderTextColor={COLORS.text.muted}
            />
            <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
              <Icon name="plus" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* ═══ REGIONAL VARIANTS SECTION ═══ */}
          <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
            <Icon name="map-marker-outline" size={20} color={COLORS.text.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Regional Variants</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{variants.length}</Text>
            </View>
          </View>

          {variants.map(v => (
            <View key={v.id} style={[styles.variantCard, themed.card]}>
              <View style={styles.variantInfo}>
                <Text style={styles.variantName}>{v.name}</Text>
                <Text style={styles.variantDesc}>{v.description}</Text>
                <View style={styles.variantMeta}>
                  <View style={[styles.spiceBadge, {
                    backgroundColor: v.spiceLevel === 'spicy' ? themed.colors.accentBg.red : v.spiceLevel === 'medium' ? themed.colors.accentBg.orange : themed.colors.accentBg.green,
                  }]}>
                    <Text style={[styles.spiceText, {
                      color: v.spiceLevel === 'spicy' ? '#C62828' : v.spiceLevel === 'medium' ? '#E65100' : '#388E3C',
                    }]}>{v.spiceLevel}</Text>
                  </View>
                  {v.extraIngredients && v.extraIngredients.length > 0 && (
                    <Text style={styles.extraIngText}>+{v.extraIngredients.join(', ')}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => removeVariant(v.id)} style={styles.removeBtn}>
                <Icon name="close-circle" size={18} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addVariantBtn}
            onPress={() => setShowAddVariant(!showAddVariant)}
          >
            <Icon name="plus-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.addVariantBtnText}>Add Variant</Text>
          </TouchableOpacity>

          {showAddVariant && (
            <View style={[styles.variantForm, themed.card]}>
              <View style={styles.inlineFormHeader}>
                <Text style={styles.inlineFormTitle}>New Variant</Text>
                <TouchableOpacity onPress={() => setShowAddVariant(false)} style={styles.inlineFormClose}>
                  <Icon name="close" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, themed.inputBg, { marginBottom: SPACING.sm }]}
                value={variantName}
                onChangeText={setVariantName}
                placeholder="Variant name (e.g. Chettinad Style)"
                placeholderTextColor={COLORS.text.muted}
              />
              <TextInput
                style={[styles.input, themed.inputBg, { marginBottom: SPACING.sm }]}
                value={variantDesc}
                onChangeText={setVariantDesc}
                placeholder="Description"
                placeholderTextColor={COLORS.text.muted}
              />
              <Text style={[styles.miniLabel, themed.textSecondary]}>Spice Level</Text>
              <View style={styles.spiceRow}>
                {(['mild', 'medium', 'spicy'] as const).map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.spiceOption, variantSpice === level && styles.spiceOptionActive]}
                    onPress={() => setVariantSpice(level)}
                  >
                    <Text style={[styles.spiceOptionText, variantSpice === level && styles.spiceOptionTextActive]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, themed.inputBg, { marginBottom: SPACING.sm }]}
                value={variantIngredients}
                onChangeText={setVariantIngredients}
                placeholder="Extra ingredients (comma separated)"
                placeholderTextColor={COLORS.text.muted}
              />
              <TouchableOpacity style={styles.confirmAddBtn} onPress={addVariant}>
                <Icon name="check" size={16} color="#FFF" />
                <Text style={styles.confirmAddBtnText}>Add Variant</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cooking Video URL */}
          <View style={[styles.field, { marginTop: SPACING.lg }]}>
            <Text style={[styles.label, themed.textPrimary]}>Cooking Video URL (optional)</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={cookingVideoUrl}
              onChangeText={setCookingVideoUrl}
              placeholder="https://youtube.com/..."
              placeholderTextColor={COLORS.text.muted}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Availability Toggle */}
          <View style={[styles.card, themed.card]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, themed.textPrimary]}>Available</Text>
                <Text style={[styles.toggleDesc, themed.textSecondary]}>
                  Toggle pack availability for customers
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={isAvailable ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.saveBtnGradient}>
              <Icon name="content-save" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>{isEditing ? 'Update Pack' : 'Create Pack'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Button */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
              <Icon name="delete-outline" size={20} color={COLORS.status.error} />
              <Text style={styles.deleteBtnText}>Delete Pack</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
          </Pressable>
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

  /* Preview */
  previewCard: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.base, ...SHADOW.sm },
  previewImage: { width: '100%', height: 140 },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.md, backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  previewName: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  previewTag: { fontSize: 11, fontWeight: '700', color: '#FFF', backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },

  /* Form fields */
  field: { marginBottom: SPACING.base },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  miniLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
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
  pickerLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: SPACING.sm },

  /* Color picker */
  colorPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  colorOption: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  colorOptionActive: { borderColor: COLORS.primary },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },

  /* Section headers */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', flex: 1 },
  sectionBadge: {
    minWidth: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },

  /* Item card */
  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  itemUnit: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 4 },

  /* Add item buttons */
  addItemRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  addItemBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
  },
  addItemBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  /* Product picker */
  productPickerWrap: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.base, ...SHADOW.md,
  },
  productPickerScroll: { maxHeight: 250 },
  productPickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  productPickerImage: { width: 40, height: 40, borderRadius: RADIUS.sm },
  productPickerName: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  productPickerMeta: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },

  /* Custom item form */
  customItemForm: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.base, ...SHADOW.md,
  },
  confirmAddBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: 10, marginTop: SPACING.sm,
  },
  confirmAddBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  /* Step card */
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  stepNumber: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  stepText: { fontSize: 13, color: COLORS.text.primary, flex: 1, lineHeight: 18 },

  addStepRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  addStepBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Variant card */
  variantCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  variantInfo: { flex: 1 },
  variantName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  variantDesc: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  variantMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 6 },
  spiceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  spiceText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  extraIngText: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic' },

  addVariantBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    marginBottom: SPACING.sm,
  },
  addVariantBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  variantForm: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.base, ...SHADOW.md,
  },
  inlineFormHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  inlineFormTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  inlineFormClose: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  spiceRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  spiceOption: {
    flex: 1, paddingVertical: 8, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  spiceOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  spiceOptionText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  spiceOptionTextActive: { color: COLORS.primary },

  /* Toggle */
  card: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontWeight: '700' },
  toggleDesc: { fontSize: 12, marginTop: 2 },

  /* Save / Delete */
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
