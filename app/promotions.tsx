// app/promotions.tsx - Promotions Management Screen
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '@/src/utils/theme';
import { loadPromotions, savePromotions } from '@/src/utils/localJsonStorage';
import type { Promotion, PromotionType } from '@/types';

const TYPE_OPTIONS: { value: PromotionType; label: string; color: string }[] = [
  { value: 'discount', label: 'Discount', color: '#2E7D32' },
  { value: 'min_order', label: 'Min Order', color: '#1565C0' },
  { value: 'new_arrival', label: 'New Arrival', color: '#7B1FA2' },
  { value: 'seasonal_banner', label: 'Seasonal', color: '#F57C00' },
];

function getTypeBadge(type: PromotionType) {
  switch (type) {
    case 'discount':
      return { label: 'Discount', bg: '#E8F5E9', color: '#2E7D32' };
    case 'min_order':
      return { label: 'Min Order', bg: '#E3F2FD', color: '#1565C0' };
    case 'new_arrival':
      return { label: 'New Arrival', bg: '#F3E5F5', color: '#7B1FA2' };
    case 'seasonal_banner':
      return { label: 'Seasonal', bg: '#FFF3E0', color: '#F57C00' };
    default:
      return { label: type, bg: COLORS.background, color: COLORS.text.secondary };
  }
}

function getPromoStatus(promo: Promotion): { label: string; color: string; bg: string } {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  if (!promo.isActive) return { label: 'PAUSED', color: '#757575', bg: '#F5F5F5' };
  if (now < start) return { label: 'SCHEDULED', color: '#1565C0', bg: '#E3F2FD' };
  if (now > end) return { label: 'EXPIRED', color: '#D32F2F', bg: '#FFEBEE' };
  return { label: 'ACTIVE', color: '#2E7D32', bg: '#E8F5E9' };
}

export default function PromotionsScreen() {
  const router = useRouter();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionType>('discount');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const summary = useMemo(() => {
    const now = new Date();
    let active = 0, scheduled = 0, expired = 0;
    promotions.forEach(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      if (!p.isActive) return;
      if (now < start) scheduled++;
      else if (now > end) expired++;
      else active++;
    });
    return { active, scheduled, expired };
  }, [promotions]);

  useEffect(() => {
    hydrate();
  }, []);

  const hydrate = async () => {
    const data = await loadPromotions();
    setPromotions(data);
  };

  const persist = useCallback(async (updated: Promotion[]) => {
    setPromotions(updated);
    await savePromotions(updated);
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('discount');
    setDiscountValue('');
    setDiscountType('flat');
    setMinOrderAmount('');
    setStartDate('');
    setEndDate('');
    setShowForm(false);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Promotion title is required.');
      return;
    }
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('Validation', 'Please enter start and end dates.');
      return;
    }

    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      type,
      title: title.trim(),
      description: description.trim(),
      discountValue: type === 'discount' && discountValue ? Number(discountValue) : undefined,
      discountType: type === 'discount' ? discountType : undefined,
      minOrder: type === 'min_order' && minOrderAmount ? Number(minOrderAmount) : undefined,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      isActive: true,
    };

    await persist([newPromo, ...promotions]);
    resetForm();
  };

  const handleToggleActive = async (promo: Promotion) => {
    const updated = promotions.map((p) =>
      p.id === promo.id ? { ...p, isActive: !p.isActive } : p,
    );
    await persist(updated);
  };

  const handleDelete = (promo: Promotion) => {
    Alert.alert(
      'Delete Promotion',
      `Are you sure you want to delete "${promo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = promotions.filter((p) => p.id !== promo.id);
            await persist(updated);
          },
        },
      ],
    );
  };

  const renderPromotion = ({ item }: { item: Promotion }) => {
    const badge = getTypeBadge(item.type);
    const status = getPromoStatus(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                activeOpacity={0.7}
                style={styles.deleteBtn}
              >
                <Icon name="delete-outline" size={18} color={COLORS.status.error} />
              </TouchableOpacity>
            </View>
          </View>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>

        <View style={styles.cardMeta}>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          {item.discountValue != null && item.type === 'discount' && (
            <Text style={styles.discountText}>
              {item.discountType === 'percent' ? `${item.discountValue}% off` : `\u20B9${item.discountValue} off`}
            </Text>
          )}
          {item.minOrder != null && item.type === 'min_order' && (
            <Text style={styles.discountText}>
              Min {'\u20B9'}{item.minOrder}
            </Text>
          )}
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.dateRow}>
            <Icon name="calendar-range" size={14} color={COLORS.text.muted} />
            <Text style={styles.dateText}>
              {item.startDate} - {item.endDate}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            {status.label === 'ACTIVE' && (
              <TouchableOpacity
                onPress={() => handleToggleActive(item)}
                activeOpacity={0.7}
                style={styles.pauseBtn}
              >
                <Icon name="pause" size={14} color={COLORS.text.secondary} />
                <Text style={styles.pauseBtnText}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleToggleActive(item)}
              activeOpacity={0.7}
            >
              <Icon
                name={item.isActive ? 'toggle-switch' : 'toggle-switch-off-outline'}
                size={32}
                color={item.isActive ? COLORS.primary : COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

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
            <Text style={styles.headerTitle}>Promotions</Text>
            <TouchableOpacity
              style={styles.createHeaderBtn}
              onPress={handleCreate}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={20} color={COLORS.primary} />
              <Text style={styles.createHeaderText}>Create</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Promotions List */}
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={renderPromotion}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={promotions.length > 0 ? (
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#2E7D32' }]}>{summary.active}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#1565C0' }]}>{summary.scheduled}</Text>
              <Text style={styles.summaryLabel}>Scheduled</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: '#D32F2F' }]}>{summary.expired}</Text>
              <Text style={styles.summaryLabel}>Expired</Text>
            </View>
          </View>
        ) : null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="sale" size={64} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No promotions yet</Text>
            <Text style={styles.emptySub}>Tap "Create" to add your first promotion</Text>
          </View>
        }
      />

      {/* Create Promotion Form */}
      {showForm && (
        <View style={styles.formContainer}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>New Promotion</Text>
              <TouchableOpacity onPress={resetForm} activeOpacity={0.7}>
                <Icon name="close" size={22} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Promotion title"
                placeholderTextColor={COLORS.text.muted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Promotion description"
                placeholderTextColor={COLORS.text.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Type Selector */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pillRow}>
                {TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.typePill,
                      type === opt.value && { backgroundColor: opt.color, borderColor: opt.color },
                    ]}
                    onPress={() => setType(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.typePillText,
                      type === opt.value && styles.typePillTextActive,
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Discount Type + Value (conditional) */}
            {type === 'discount' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Discount Type</Text>
                  <View style={styles.discountTypeRow}>
                    <TouchableOpacity
                      style={[styles.discountTypePill, discountType === 'percent' && styles.discountTypePillActive]}
                      onPress={() => setDiscountType('percent')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.discountTypePillText, discountType === 'percent' && { color: '#FFF' }]}>Percentage</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.discountTypePill, discountType === 'flat' && styles.discountTypePillActive]}
                      onPress={() => setDiscountType('flat')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.discountTypePillText, discountType === 'flat' && { color: '#FFF' }]}>Flat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Discount Value</Text>
                  <View style={styles.prefixInputWrap}>
                    <Text style={styles.prefixText}>{discountType === 'percent' ? '%' : '\u20B9'}</Text>
                    <TextInput
                      style={styles.prefixInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.text.muted}
                      value={discountValue}
                      onChangeText={setDiscountValue}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Min Order Amount (conditional) */}
            {type === 'min_order' && (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Minimum Order Amount</Text>
                <View style={styles.prefixInputWrap}>
                  <Text style={styles.prefixText}>{'\u20B9'}</Text>
                  <TextInput
                    style={styles.prefixInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.text.muted}
                    value={minOrderAmount}
                    onChangeText={setMinOrderAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {/* Start Date */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.muted}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            {/* End Date */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>End Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.text.muted}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Promotion</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
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
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  createHeaderText: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.primary,
  },

  // List
  listContent: {
    padding: SPACING.base,
    paddingBottom: 120,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardTop: {
    marginBottom: SPACING.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  cardTitle: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentBg.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: 11,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },
  discountText: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
    minHeight: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.text.muted,
  },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    ...FONTS.extraBold,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    height: 22,
  },
  statusBadgeText: {
    fontSize: 9,
    ...FONTS.bold,
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  // Pause Button
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 28,
  },
  pauseBtnText: {
    fontSize: 11,
    ...FONTS.semiBold,
    color: COLORS.text.secondary,
  },

  // Discount Type Toggle
  discountTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  discountTypePill: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discountTypePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  discountTypePillText: {
    fontSize: 13,
    ...FONTS.semiBold,
    color: COLORS.text.secondary,
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

  // Form
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.base,
    paddingBottom: SPACING.xxl,
    ...SHADOW.floating,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  formTitle: {
    fontSize: 18,
    ...FONTS.bold,
    color: COLORS.text.primary,
  },
  fieldWrap: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: 13,
    ...FONTS.semiBold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  prefixInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  prefixText: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  prefixInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    paddingVertical: SPACING.md,
  },

  // Type pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typePillText: {
    fontSize: 13,
    ...FONTS.semiBold,
    color: COLORS.text.secondary,
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },

  // Save
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.md,
  },
  saveBtnText: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.text.white,
  },
});
