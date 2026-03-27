import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '@/src/utils/theme';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';

const SHOP_KEY = '@owner_shop_profile';

interface ShopProfile {
  name: string;
  address: string;
  phone: string;
  gstNumber: string;
  openingTime: string;
  closingTime: string;
  deliveryRadius: string;
  deliveryFee: string;
  minOrder: string;
  isOpen: boolean;
  acceptCOD: boolean;
  acceptOnline: boolean;
  upiId: string;
}

const DEFAULT_SHOP: ShopProfile = {
  name: '', address: '', phone: '', gstNumber: '',
  openingTime: '', closingTime: '',
  deliveryRadius: '', deliveryFee: '', minOrder: '',
  isOpen: true, acceptCOD: true, acceptOnline: false, upiId: '',
};

export default function ShopProfileScreen() {
  const router = useRouter();
  const [shop, setShop] = useState<ShopProfile>(DEFAULT_SHOP);

  useEffect(() => {
    getStoredData<ShopProfile>(SHOP_KEY, DEFAULT_SHOP).then(setShop);
  }, []);

  const set = (key: keyof ShopProfile, value: string | boolean) =>
    setShop(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!shop.name.trim()) {
      Alert.alert('Validation', 'Shop name is required.');
      return;
    }
    await setStoredData(SHOP_KEY, shop);
    Alert.alert('Success', 'Shop profile updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <LinearGradient colors={['#B8E0CF', '#D6EFE3']} style={styles.header}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Shop Profile</Text>
              <View style={{ width: 38 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Basic Info */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Shop Name *</Text>
            <TextInput style={styles.input} placeholder="Enter shop name" placeholderTextColor={COLORS.text.muted} value={shop.name} onChangeText={v => set('name', v)} />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Address</Text>
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Enter shop address" placeholderTextColor={COLORS.text.muted} value={shop.address} onChangeText={v => set('address', v)} multiline numberOfLines={3} textAlignVertical="top" />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} placeholder="Enter phone number" placeholderTextColor={COLORS.text.muted} value={shop.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>GST Number</Text>
            <TextInput style={styles.input} placeholder="Enter GST number" placeholderTextColor={COLORS.text.muted} value={shop.gstNumber} onChangeText={v => set('gstNumber', v)} autoCapitalize="characters" />
          </View>

          {/* Operating Hours */}
          <View style={styles.sectionHeader}>
            <Icon name="clock-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Operating Hours</Text>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Opening Time</Text>
            <TextInput style={styles.input} placeholder="07:00" placeholderTextColor={COLORS.text.muted} value={shop.openingTime} onChangeText={v => set('openingTime', v)} />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Closing Time</Text>
            <TextInput style={styles.input} placeholder="22:00" placeholderTextColor={COLORS.text.muted} value={shop.closingTime} onChangeText={v => set('closingTime', v)} />
          </View>

          {/* Delivery Settings */}
          <View style={styles.sectionHeader}>
            <Icon name="truck-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Delivery Settings</Text>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Delivery Radius</Text>
            <View style={styles.suffixInputWrap}>
              <TextInput style={styles.suffixInput} placeholder="0" placeholderTextColor={COLORS.text.muted} value={shop.deliveryRadius} onChangeText={v => set('deliveryRadius', v)} keyboardType="numeric" />
              <Text style={styles.suffixText}>km</Text>
            </View>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Delivery Fee</Text>
            <View style={styles.prefixInputWrap}>
              <Text style={styles.prefixText}>{'\u20B9'}</Text>
              <TextInput style={styles.prefixInput} placeholder="0" placeholderTextColor={COLORS.text.muted} value={shop.deliveryFee} onChangeText={v => set('deliveryFee', v)} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Minimum Order</Text>
            <View style={styles.prefixInputWrap}>
              <Text style={styles.prefixText}>{'\u20B9'}</Text>
              <TextInput style={styles.prefixInput} placeholder="0" placeholderTextColor={COLORS.text.muted} value={shop.minOrder} onChangeText={v => set('minOrder', v)} keyboardType="numeric" />
            </View>
          </View>

          {/* Payment Settings */}
          <View style={styles.sectionHeader}>
            <Icon name="credit-card-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payment Settings</Text>
          </View>

          <View style={styles.toggleRow}>
            <Icon name={shop.acceptCOD ? 'toggle-switch' : 'toggle-switch-off-outline'} size={36} color={shop.acceptCOD ? COLORS.primary : COLORS.text.muted} onPress={() => set('acceptCOD', !shop.acceptCOD)} />
            <TouchableOpacity style={styles.toggleInfo} onPress={() => set('acceptCOD', !shop.acceptCOD)} activeOpacity={0.7}>
              <Text style={styles.toggleLabel}>Cash on Delivery</Text>
              <Text style={styles.toggleSub}>{shop.acceptCOD ? 'Customers can pay with cash' : 'COD is disabled'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Icon name={shop.acceptOnline ? 'toggle-switch' : 'toggle-switch-off-outline'} size={36} color={shop.acceptOnline ? COLORS.primary : COLORS.text.muted} onPress={() => set('acceptOnline', !shop.acceptOnline)} />
            <TouchableOpacity style={styles.toggleInfo} onPress={() => set('acceptOnline', !shop.acceptOnline)} activeOpacity={0.7}>
              <Text style={styles.toggleLabel}>Online Payment</Text>
              <Text style={styles.toggleSub}>{shop.acceptOnline ? 'Customers can pay online' : 'Online payment is disabled'}</Text>
            </TouchableOpacity>
          </View>

          {shop.acceptOnline && (
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>UPI ID</Text>
              <TextInput style={styles.input} placeholder="yourstore@upi" placeholderTextColor={COLORS.text.muted} value={shop.upiId} onChangeText={v => set('upiId', v)} autoCapitalize="none" />
            </View>
          )}

          <View style={styles.toggleRow}>
            <Icon name={shop.isOpen ? 'toggle-switch' : 'toggle-switch-off-outline'} size={36} color={shop.isOpen ? COLORS.primary : COLORS.text.muted} onPress={() => set('isOpen', !shop.isOpen)} />
            <TouchableOpacity style={styles.toggleInfo} onPress={() => set('isOpen', !shop.isOpen)} activeOpacity={0.7}>
              <Text style={styles.toggleLabel}>Shop is {shop.isOpen ? 'Open' : 'Closed'}</Text>
              <Text style={styles.toggleSub}>{shop.isOpen ? 'Customers can place orders' : 'Customers cannot place orders'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, ...FONTS.extraBold, color: COLORS.text.primary },
  scrollContent: { padding: SPACING.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.text.primary },
  fieldWrap: { marginBottom: SPACING.base },
  label: { fontSize: 13, ...FONTS.semiBold, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  input: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: 15, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.border },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  prefixInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md },
  prefixText: { fontSize: 16, ...FONTS.bold, color: COLORS.text.primary, marginRight: SPACING.xs },
  prefixInput: { flex: 1, fontSize: 15, color: COLORS.text.primary, paddingVertical: SPACING.md },
  suffixInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md },
  suffixInput: { flex: 1, fontSize: 15, color: COLORS.text.primary, paddingVertical: SPACING.md },
  suffixText: { fontSize: 14, ...FONTS.bold, color: COLORS.text.secondary, marginLeft: SPACING.xs },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.base, gap: SPACING.md },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 15, ...FONTS.semiBold, color: COLORS.text.primary },
  toggleSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.base, alignItems: 'center', marginTop: SPACING.sm, ...SHADOW.md },
  saveBtnText: { fontSize: 16, ...FONTS.bold, color: '#FFF' },
});
