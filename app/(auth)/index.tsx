import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

export default function SplashScreen() {
  const themed = useThemedStyles();
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => router.replace('/(auth)/onboarding'), 1000);
    });
  }, []);

  return (
    <LinearGradient colors={themed.headerGradient} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoCircle}>
          <Icon name="store" size={52} color={COLORS.primary} />
        </View>
        <Text style={[styles.appName, themed.textPrimary]}>Chopify Owner</Text>
        <Text style={[styles.tagline, { color: themed.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(31,31,31,0.7)' }]}>Manage Your Cutting Business</Text>
      </Animated.View>
      <Text style={[styles.powered, { color: themed.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(31,31,31,0.4)' }]}>Soruban Retail Solutions</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  powered: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
  },
});
