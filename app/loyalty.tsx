import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { loadLoyaltyConfig, saveLoyaltyConfig } from '@/src/utils/localJsonStorage';
import type { LoyaltyConfig, LoyaltyType, RewardType } from '@/types';

const LOYALTY_TYPES: { key: LoyaltyType; label: string; icon: string }[] = [
  { key: 'order_count', label: 'Order Count', icon: 'cart-outline' },
  { key: 'spend_value', label: 'Spend Value', icon: 'currency-inr' },
];

const REWARD_TYPES: { key: RewardType; label: string; icon: string }[] = [
  { key: 'discount_percent', label: 'Discount %', icon: 'percent' },
  { key: 'flat_discount', label: 'Flat Discount', icon: 'cash' },
  { key: 'free_delivery', label: 'Free Delivery', icon: 'truck-outline' },
];

function generateId(): string {
  return 'loyalty_' + Date.now().toString(36);
}

export default function LoyaltyScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loyaltyType, setLoyaltyType] = useState<LoyaltyType>('order_count');
  const [threshold, setThreshold] = useState('');
  const [rewardType, setRewardType] = useState<RewardType>('discount_percent');
  const [rewardValue, setRewardValue] = useState('');
  const [configId, setConfigId] = useState('');

  const stats = { enrolled: 0, earned: 0, redeemed: 0, totalValue: 0 };

  useEffect(() => {
    loadLoyaltyConfig().then((config) => {
      if (config) {
        setConfigId(config.id);
        setIsEnabled(config.isEnabled);
        setLoyaltyType(config.loyaltyType);
        setThreshold(String(config.threshold));
        setRewardType(config.rewardType);
        setRewardValue(String(config.rewardValue));
      }
    });
  }, []);

  const handleSave = async () => {
    if (isEnabled && !threshold.trim()) {
      Alert.alert('Validation', 'Please enter a threshold value.');
      return;
    }
    if (isEnabled && rewardType !== 'free_delivery' && !rewardValue.trim()) {
      Alert.alert('Validation', 'Please enter a reward value.');
      return;
    }
    const config: LoyaltyConfig = {
      id: configId || generateId(),
      isEnabled, loyaltyType,
      threshold: Number(threshold) || 0,
      rewardType,
      rewardValue: rewardType === 'free_delivery' ? 0 : Number(rewardValue) || 0,
      updatedAt: new Date().toISOString(),
    };
    await saveLoyaltyConfig(config);
    setConfigId(config.id);
    Alert.alert('Success', 'Loyalty program settings saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const getPreviewText = (): string => {
    const thresholdNum = Number(threshold) || 0;
    const rewardNum = Number(rewardValue) || 0;
    if (!isEnabled) return 'Loyalty program is disabled';
    const condition = loyaltyType === 'order_count'
      ? `After ${thresholdNum} orders`
      : `After spending \u20B9${thresholdNum}`;
    let reward = '';
    switch (rewardType) {
      case 'discount_percent': reward = `${rewardNum}% discount on next order`; break;
      case 'flat_discount': reward = `\u20B9${rewardNum} off on next order`; break;
      case 'free_delivery': reward = 'Free delivery on next order'; break;
    }
    return `${condition}, customers get ${reward}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <LinearGradient colors={['#B8E0CF', '#D6EFE3']} style={styles.header}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Loyalty Program</Text>
              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Enable/Disable Toggle */}
          <TouchableOpacity style={styles.toggleCard} onPress={() => setIsEnabled(prev => !prev)} activeOpacity={0.7}>
            <View style={styles.toggleLeft}>
              <Icon name="gift-outline" size={24} color={isEnabled ? COLORS.primary : COLORS.text.muted} />
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Loyalty Program {isEnabled ? 'Enabled' : 'Disabled'}</Text>
                <Text style={styles.toggleSub}>{isEnabled ? 'Customers earn rewards on purchases' : 'Enable to start rewarding customers'}</Text>
              </View>
            </View>
            <Icon name={isEnabled ? 'toggle-switch' : 'toggle-switch-off-outline'} size={40} color={isEnabled ? COLORS.primary : COLORS.text.muted} />
          </TouchableOpacity>

          {isEnabled && (
            <>
              {/* Loyalty Type */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Loyalty Type</Text>
                <View style={styles.pillRow}>
                  {LOYALTY_TYPES.map((opt) => {
                    const active = loyaltyType === opt.key;
                    return (
                      <TouchableOpacity key={opt.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setLoyaltyType(opt.key)} activeOpacity={0.7}>
                        <Icon name={opt.icon as any} size={18} color={active ? '#FFF' : COLORS.text.secondary} />
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Threshold */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{loyaltyType === 'order_count' ? 'Orders Required' : 'Spend Amount Required'}</Text>
                <View style={styles.inputRow}>
                  {loyaltyType === 'spend_value' && <Text style={styles.inputPrefix}>{'\u20B9'}</Text>}
                  <TextInput style={styles.input} placeholder={loyaltyType === 'order_count' ? 'e.g. 10' : 'e.g. 5000'} placeholderTextColor={COLORS.text.muted} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
                  {loyaltyType === 'order_count' && <Text style={styles.inputSuffix}>orders</Text>}
                </View>
              </View>

              {/* Reward Type */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Reward Type</Text>
                <View style={styles.pillRow}>
                  {REWARD_TYPES.map((opt) => {
                    const active = rewardType === opt.key;
                    return (
                      <TouchableOpacity key={opt.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setRewardType(opt.key)} activeOpacity={0.7}>
                        <Icon name={opt.icon as any} size={18} color={active ? '#FFF' : COLORS.text.secondary} />
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Reward Value */}
              {rewardType !== 'free_delivery' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{rewardType === 'discount_percent' ? 'Discount Percentage' : 'Discount Amount'}</Text>
                  <View style={styles.inputRow}>
                    {rewardType === 'flat_discount' && <Text style={styles.inputPrefix}>{'\u20B9'}</Text>}
                    <TextInput style={styles.input} placeholder={rewardType === 'discount_percent' ? 'e.g. 10' : 'e.g. 200'} placeholderTextColor={COLORS.text.muted} value={rewardValue} onChangeText={setRewardValue} keyboardType="numeric" />
                    {rewardType === 'discount_percent' && <Text style={styles.inputSuffix}>%</Text>}
                  </View>
                </View>
              )}

              {/* Preview */}
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Icon name="eye-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.previewTitle}>Customer Preview</Text>
                </View>
                <Text style={styles.previewText}>{getPreviewText()}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsCard}>
                <Text style={styles.sectionTitle}>Loyalty Stats</Text>
                <View style={styles.statsRow}>
                  {[{ label: 'Enrolled', value: stats.enrolled }, { label: 'Earned', value: stats.earned }, { label: 'Redeemed', value: stats.redeemed }, { label: 'Value', value: `\u20B9${stats.totalValue}` }].map((s, i) => (
                    <React.Fragment key={s.label}>
                      {i > 0 && <View style={styles.statDivider} />}
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Icon name="content-save-outline" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>Save Configuration</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxl },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  toggleCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, ...SHADOW.sm },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  toggleSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  pillRow: { flexDirection: 'row', gap: SPACING.sm },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  pillTextActive: { color: '#FFF' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md },
  input: { flex: 1, fontSize: 15, color: COLORS.text.primary, paddingVertical: SPACING.md },
  inputPrefix: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginRight: SPACING.xs },
  inputSuffix: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary, marginLeft: SPACING.xs },
  previewCard: { backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '30' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  previewTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  previewText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  statsCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: 2 },
  statLabel: { fontSize: 10, color: COLORS.text.muted },
  statDivider: { width: 1, backgroundColor: COLORS.divider },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.base, borderRadius: RADIUS.lg, marginTop: SPACING.sm, ...SHADOW.md },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
