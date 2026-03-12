import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW, FONTS } from '@/src/utils/theme';
import { useAuth } from '@/context/AuthContext';
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
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header / Hero */}
          <LinearGradient
            colors={themed.headerGradient}
            style={styles.heroSection}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Icon
                name="chevron-left"
                size={28}
                color={themed.colors.text.primary}
              />
            </TouchableOpacity>

            <View style={styles.heroContent}>
              <View style={styles.heroIconWrap}>
                <Icon name="store" size={40} color={COLORS.primary} />
              </View>
              <Text style={[styles.heroTitle, themed.textPrimary]}>
                Welcome Back
              </Text>
              <Text style={[styles.heroSubtitle, themed.textSecondary]}>
                Sign in to manage your business
              </Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={[styles.formContainer, themed.card]}>
            {/* Error Message */}
            {error !== '' && (
              <View style={styles.errorBox}>
                <Icon name="alert-circle-outline" size={18} color={COLORS.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Phone Input */}
            <Text style={[styles.label, themed.textSecondary]}>
              Phone Number
            </Text>
            <View style={[styles.inputRow, themed.inputBg]}>
              <View style={styles.inputIconWrap}>
                <Icon name="phone-outline" size={20} color={COLORS.text.muted} />
              </View>
              <TextInput
                style={[styles.input, { color: themed.colors.text.primary }]}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError('');
                }}
                autoComplete="tel"
              />
            </View>

            {/* Password Input */}
            <Text style={[styles.label, themed.textSecondary]}>Password</Text>
            <View style={[styles.inputRow, themed.inputBg]}>
              <View style={styles.inputIconWrap}>
                <Icon name="lock-outline" size={20} color={COLORS.text.muted} />
              </View>
              <TextInput
                style={[styles.input, { color: themed.colors.text.primary }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.text.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.text.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInBtn,
                (!canSubmit || isLoading) && styles.signInBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={!canSubmit || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.signInBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo Credentials Hint */}
            <View style={styles.demoHintContainer}>
              <View style={styles.demoHintDivider}>
                <View style={styles.demoHintLine} />
                <Text style={styles.demoHintLabel}>DEMO CREDENTIALS</Text>
                <View style={styles.demoHintLine} />
              </View>
              <View style={styles.demoCredentials}>
                <View style={styles.demoRow}>
                  <Icon name="phone" size={14} color={COLORS.text.muted} />
                  <Text style={styles.demoText}>9999999999</Text>
                </View>
                <View style={styles.demoDot} />
                <View style={styles.demoRow}>
                  <Icon name="lock" size={14} color={COLORS.text.muted} />
                  <Text style={styles.demoText}>owner123</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  heroSection: {
    overflow: 'hidden',
  },
  backBtn: {
    paddingHorizontal: SPACING.base,
    paddingTop: 48,
    paddingBottom: SPACING.xs,
    alignSelf: 'flex-start',
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: SPACING.xl,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // Form
  formContainer: {
    flex: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    overflow: 'hidden',
  },
  inputIconWrap: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.status.error,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Sign In Button
  signInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
    ...SHADOW.sm,
  },
  signInBtnDisabled: {
    backgroundColor: '#B0BEC5',
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Demo Hint
  demoHintContainer: {
    marginTop: 32,
  },
  demoHintDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  demoHintLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  demoHintLabel: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 0.5,
  },
  demoCredentials: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text.muted,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
