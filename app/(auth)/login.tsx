import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, SHADOW } from '@/src/utils/theme';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const themed = useThemedStyles();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = phone.length >= 10 && password.length >= 4;

  const handleLogin = async () => {
    if (!canSubmit || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const result = await login(phone, password);
      if (!result.success) {
        setError(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await login('9999999999', 'owner123');
      if (!result.success) {
        setError(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle={themed.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <LinearGradient colors={themed.headerGradient} style={styles.heroSection}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <View style={styles.heroBg}>
              <Icon name="store" size={52} color={COLORS.primary} />
              <Text style={[styles.heroTitle, themed.textPrimary]}>Owner Login</Text>
              <Text style={styles.heroSub}>Sign in to manage your business</Text>
            </View>
          </LinearGradient>

          <View style={[styles.form, themed.card]}>
            {error !== '' && (
              <View style={[styles.errorBox, { backgroundColor: themed.colors.accentBg.red }]}>
                <Icon name="alert-circle-outline" size={18} color={COLORS.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputRow, themed.inputBg]}>
              <View style={[styles.prefix, { backgroundColor: themed.isDark ? '#2A2A2A' : '#F7F7F7', borderRightColor: themed.colors.border }]}>
                <Text style={styles.prefixText}>{'\ud83c\uddee\ud83c\uddf3'} +91</Text>
              </View>
              <TextInput
                style={[styles.input, themed.textPrimary]}
                placeholder="Enter 10-digit number"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError('');
                }}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputRow, themed.inputBg]}>
              <View style={[styles.prefix, { backgroundColor: themed.isDark ? '#2A2A2A' : '#F7F7F7', borderRightColor: themed.colors.border }]}>
                <Icon name="lock-outline" size={18} color={COLORS.text.secondary} />
              </View>
              <TextInput
                style={[styles.input, themed.textPrimary]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.text.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.text.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, (!canSubmit || isLoading) && [styles.btnDisabled, { backgroundColor: themed.isDark ? '#444' : '#CCC' }]]}
              onPress={handleLogin}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>OR</Text>
              <View style={styles.divLine} />
            </View>

            <TouchableOpacity style={[styles.demoBtn, { backgroundColor: themed.colors.card }]} onPress={demoLogin}>
              <Text style={styles.demoBtnText}>{'\u26a1'} Demo Login (Skip Password)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1 },
  back: { paddingHorizontal: SPACING.base, paddingTop: 44, paddingBottom: SPACING.sm },
  heroSection: { overflow: 'hidden' },
  heroBg: {
    paddingVertical: 36, paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text.primary, marginTop: 12, marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(31,31,31,0.7)' },
  form: { padding: 24 },
  label: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: 20,
    ...SHADOW.sm,
  },
  prefix: {
    paddingHorizontal: 14, paddingVertical: 14,
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  prefixText: { fontWeight: '600', color: COLORS.text.secondary, fontSize: 14 },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 16, color: COLORS.text.primary },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18, gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: COLORS.status.error, fontWeight: '500' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: 15, alignItems: 'center', marginBottom: 16, minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: '#CCC' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { marginHorizontal: 12, color: COLORS.text.muted, fontSize: 13 },
  demoBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: RADIUS.full, paddingVertical: 13,
    alignItems: 'center', marginBottom: 16,
  },
  demoBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
