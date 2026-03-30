import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useCoupons } from '@/context/CouponContext';
import type { Coupon, DiscountType } from '@/types';

const CATEGORY_OPTIONS = ['', 'Vegetables', 'Fruits', 'Salad Packs', 'Healthy Drinks', 'Dish Packs', 'Diet Foods'];

export default function CouponFormScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCoupons();

  const isEditing = Boolean(id);
  const existingCoupon = useMemo(() => (id ? coupons.find(c => c.id === id) : undefined), [id, coupons]);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (existingCoupon) {
      setCode(existingCoupon.code);
      setTitle(existingCoupon.title);
      setDescription(existingCoupon.description || '');
      setDiscountType(existingCoupon.discountType);
      setDiscountValue(String(existingCoupon.discountValue));
      setMinOrderValue(String(existingCoupon.minOrderValue));
      setMaxDiscount(existingCoupon.maxDiscount ? String(existingCoupon.maxDiscount) : '');
      setValidFrom(existingCoupon.validFrom);
      setValidTo(existingCoupon.validTo);
      setUsageLimit(String(existingCoupon.usageLimit));
      setIsActive(existingCoupon.isActive);
      setCategory(existingCoupon.category || '');
    }
  }, [existingCoupon]);

  const handleSave = useCallback(async () => {
    if (!code.trim()) { Alert.alert('Validation', 'Coupon code is required'); return; }
    if (!title.trim()) { Alert.alert('Validation', 'Title is required'); return; }
    if (!discountValue.trim() || isNaN(Number(discountValue))) { Alert.alert('Validation', 'Enter a valid discount value'); return; }
    if (!minOrderValue.trim() || isNaN(Number(minOrderValue))) { Alert.alert('Validation', 'Enter a valid minimum order value'); return; }
    if (!validFrom.trim() || !validTo.trim()) { Alert.alert('Validation', 'Set valid from and to dates (YYYY-MM-DD)'); return; }

    const couponData: Coupon = {
      id: isEditing ? id! : `coup_${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      validFrom: validFrom.trim(),
      validTo: validTo.trim(),
      usageLimit: Number(usageLimit) || 1,
      usedCount: existingCoupon?.usedCount || 0,
      isActive,
      category: category || undefined,
      createdAt: existingCoupon?.createdAt || new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateCoupon(id!, couponData);
        Alert.alert('Success', 'Coupon updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await addCoupon(couponData);
        Alert.alert('Success', 'Coupon created successfully', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to save coupon');
    }
  }, [code, title, description, discountType, discountValue, minOrderValue, maxDiscount, validFrom, validTo, usageLimit, isActive, category, isEditing, id, existingCoupon, addCoupon, updateCoupon, router]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Coupon', `Are you sure you want to delete "${code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteCoupon(id!);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete coupon');
          }
        },
      },
    ]);
  }, [code, id, deleteCoupon, router]);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>
            {isEditing ? 'Edit Coupon' : 'Create Coupon'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>

          {/* Coupon Code */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Coupon Code *</Text>
            <TextInput
              style={[styles.input, themed.inputBg, styles.codeInput]}
              value={code}
              onChangeText={t => setCode(t.toUpperCase())}
              placeholder="e.g. FIRST50"
              placeholderTextColor={COLORS.text.muted}
              autoCapitalize="characters"
            />
          </View>

          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Title *</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. 50% Off First Order"
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
              placeholder="Describe the offer..."
              placeholderTextColor={COLORS.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Discount Type */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Discount Type</Text>
            <View style={styles.discountTypeRow}>
              <TouchableOpacity
                style={[styles.discountTypeBtn, discountType === 'percentage' && styles.discountTypeBtnActive]}
                onPress={() => setDiscountType('percentage')}
              >
                <Icon name="percent-outline" size={18} color={discountType === 'percentage' ? COLORS.primary : COLORS.text.secondary} />
                <Text style={[styles.discountTypeBtnText, discountType === 'percentage' && styles.discountTypeBtnTextActive]}>
                  Percentage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.discountTypeBtn, discountType === 'flat' && styles.discountTypeBtnActive]}
                onPress={() => setDiscountType('flat')}
              >
                <Icon name="currency-inr" size={18} color={discountType === 'flat' ? COLORS.primary : COLORS.text.secondary} />
                <Text style={[styles.discountTypeBtnText, discountType === 'flat' && styles.discountTypeBtnTextActive]}>
                  Flat Amount
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Value & Min Order */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>
                {discountType === 'percentage' ? 'Discount %' : 'Discount ₹'} *
              </Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={discountValue}
                onChangeText={setDiscountValue}
                placeholder="0"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>Min Order ({'\u20B9'}) *</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={minOrderValue}
                onChangeText={setMinOrderValue}
                placeholder="0"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Max Discount (for percentage) */}
          {discountType === 'percentage' && (
            <View style={styles.field}>
              <Text style={[styles.label, themed.textPrimary]}>Max Discount ({'\u20B9'})</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={maxDiscount}
                onChangeText={setMaxDiscount}
                placeholder="No limit"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Validity Dates */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>Valid From *</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={validFrom}
                onChangeText={setValidFrom}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, themed.textPrimary]}>Valid To *</Text>
              <TextInput
                style={[styles.input, themed.inputBg]}
                value={validTo}
                onChangeText={setValidTo}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>
          </View>

          {/* Usage Limit */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Usage Limit (per customer)</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={usageLimit}
              onChangeText={setUsageLimit}
              placeholder="1"
              placeholderTextColor={COLORS.text.muted}
              keyboardType="numeric"
            />
          </View>

          {/* Category (optional) */}
          <View style={styles.field}>
            <Text style={[styles.label, themed.textPrimary]}>Category (optional)</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn, themed.inputBg]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.pickerText, themed.textPrimary]}>{category || 'All categories'}</Text>
              <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {showCategoryPicker && (
            <View style={[styles.pickerDropdown, themed.card]}>
              {CATEGORY_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c || 'all'}
                  style={[styles.pickerOption, category === c && styles.pickerOptionActive]}
                  onPress={() => { setCategory(c); setShowCategoryPicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, category === c && styles.pickerOptionTextActive]}>
                    {c || 'All categories'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Active Toggle */}
          <View style={[styles.card, themed.card]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, themed.textPrimary]}>Active</Text>
                <Text style={[styles.toggleDesc, themed.textSecondary]}>
                  Toggle coupon availability for customers
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={isActive ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.saveBtnGradient}>
              <Icon name="content-save" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>{isEditing ? 'Update Coupon' : 'Create Coupon'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Button */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
              <Icon name="delete-outline" size={20} color={COLORS.status.error} />
              <Text style={styles.deleteBtnText}>Delete Coupon</Text>
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
  codeInput: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.md },

  /* Discount type */
  discountTypeRow: { flexDirection: 'row', gap: SPACING.sm },
  discountTypeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  discountTypeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  discountTypeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  discountTypeBtnTextActive: { color: COLORS.primary },

  /* Pickers */
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: 15, fontWeight: '500' },
  pickerDropdown: {
    borderRadius: RADIUS.lg, padding: SPACING.sm,
    marginBottom: SPACING.base, marginTop: -SPACING.sm, ...SHADOW.md,
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs,
  },
  pickerOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  pickerOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundSoft },
  pickerOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  pickerOptionTextActive: { color: COLORS.primary },

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
