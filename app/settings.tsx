import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useTheme } from '@/context/ThemeContext';

const APP_VERSION = '1.0.0';
const SUPPORT_PHONE = '+91 98765 00000';
const SUPPORT_EMAIL = 'support@soruban.in';

export default function SettingsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { isDark, toggleTheme } = useTheme();

  const [businessName, setBusinessName] = useState('Soruban Fresh Cuts');
  const [businessPhone, setBusinessPhone] = useState('+91 98765 43210');
  const [businessAddress, setBusinessAddress] = useState('12, Market Street, Coimbatore - 641001');
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [deliveryUpdates, setDeliveryUpdates] = useState(true);
  const [editingBusiness, setEditingBusiness] = useState(false);

  const handleSaveBusiness = useCallback(() => {
    setEditingBusiness(false);
    Alert.alert('Saved', 'Business details updated successfully');
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(auth)') },
    ]);
  }, [router]);

  const handleSupport = useCallback(() => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themed.textPrimary]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Appearance Section */}
        <Text style={[styles.sectionLabel, themed.textMuted]}>APPEARANCE</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1B3A1D' : '#E8F5E9' }]}>
              <Icon name={isDark ? 'weather-night' : 'white-balance-sunny'} size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>
                {isDark ? 'Dark theme is active' : 'Light theme is active'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={isDark ? COLORS.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Business Section */}
        <Text style={[styles.sectionLabel, themed.textMuted]}>BUSINESS DETAILS</Text>
        <View style={[styles.card, themed.card]}>
          {editingBusiness ? (
            <>
              <View style={styles.editField}>
                <Text style={[styles.editLabel, themed.textSecondary]}>Business Name</Text>
                <TextInput
                  style={[styles.editInput, themed.inputBg]}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Business Name"
                  placeholderTextColor={COLORS.text.muted}
                />
              </View>
              <View style={styles.editField}>
                <Text style={[styles.editLabel, themed.textSecondary]}>Phone</Text>
                <TextInput
                  style={[styles.editInput, themed.inputBg]}
                  value={businessPhone}
                  onChangeText={setBusinessPhone}
                  placeholder="Phone"
                  placeholderTextColor={COLORS.text.muted}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.editField}>
                <Text style={[styles.editLabel, themed.textSecondary]}>Address</Text>
                <TextInput
                  style={[styles.editInput, styles.multilineInput, themed.inputBg]}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="Address"
                  placeholderTextColor={COLORS.text.muted}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingBusiness(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveDetailBtn} onPress={handleSaveBusiness}>
                  <Icon name="check" size={18} color="#FFF" />
                  <Text style={styles.saveDetailBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="store" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, themed.textPrimary]}>{businessName}</Text>
                  <Text style={[styles.settingDesc, themed.textSecondary]}>Business Name</Text>
                </View>
              </View>
              <View style={[styles.divider, themed.dividerColor]} />
              <View style={styles.detailRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Icon name="phone" size={20} color="#1565C0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, themed.textPrimary]}>{businessPhone}</Text>
                  <Text style={[styles.settingDesc, themed.textSecondary]}>Phone</Text>
                </View>
              </View>
              <View style={[styles.divider, themed.dividerColor]} />
              <View style={styles.detailRow}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Icon name="map-marker" size={20} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, themed.textPrimary]}>{businessAddress}</Text>
                  <Text style={[styles.settingDesc, themed.textSecondary]}>Address</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingBusiness(true)}>
                <Icon name="pencil" size={16} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notifications Section */}
        <Text style={[styles.sectionLabel, themed.textMuted]}>NOTIFICATIONS</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="bell-ring-outline" size={20} color="#E65100" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>Order Alerts</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>
                Get notified for new orders
              </Text>
            </View>
            <Switch
              value={orderAlerts}
              onValueChange={setOrderAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={orderAlerts ? COLORS.primary : '#f4f3f4'}
            />
          </View>
          <View style={[styles.divider, themed.dividerColor]} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="truck-check-outline" size={20} color="#7B1FA2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>Delivery Updates</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>
                Get updates on delivery status changes
              </Text>
            </View>
            <Switch
              value={deliveryUpdates}
              onValueChange={setDeliveryUpdates}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={deliveryUpdates ? COLORS.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionLabel, themed.textMuted]}>ABOUT</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.detailRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="information-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>App Version</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>{APP_VERSION}</Text>
            </View>
          </View>
          <View style={[styles.divider, themed.dividerColor]} />
          <TouchableOpacity style={styles.detailRow} onPress={handleSupport}>
            <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="headset" size={20} color="#1565C0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>Support</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>{SUPPORT_EMAIL}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.text.muted} />
          </TouchableOpacity>
          <View style={[styles.divider, themed.dividerColor]} />
          <View style={styles.detailRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="phone-outline" size={20} color="#E65100" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, themed.textPrimary]}>Helpline</Text>
              <Text style={[styles.settingDesc, themed.textSecondary]}>{SUPPORT_PHONE}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Icon name="logout" size={20} color={COLORS.status.error} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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

  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.md, marginLeft: SPACING.xs },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  settingIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 1 },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.sm },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  editField: { marginBottom: SPACING.md },
  editLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  editInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 10, fontSize: 14,
  },
  multilineInput: { minHeight: 60, textAlignVertical: 'top' },

  editActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  cancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.lg, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text.secondary },
  saveDetailBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary,
  },
  saveDetailBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: RADIUS.lg, marginTop: SPACING.lg,
    borderWidth: 1.5, borderColor: COLORS.status.error,
    backgroundColor: '#FFEBEE',
  },
  logoutBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.status.error },
});
