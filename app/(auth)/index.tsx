import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const themed = useThemedStyles();
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#388E3C', '#4CAF50', '#66BB6A']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.heroContent}>
          <Animated.View
            style={[
              styles.logoWrap,
              { transform: [{ scale: logoScale }], opacity: logoOpacity },
            ]}
          >
            <View style={styles.logoCircle}>
              <Icon name="store" size={56} color="#388E3C" />
            </View>
            <Text style={styles.appName}>Chopify Owner</Text>
            <Text style={styles.tagline}>Manage your cutting business</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View
        style={[
          styles.bottomSection,
          themed.safeArea,
          {
            transform: [{ translateY: contentTranslateY }],
            opacity: contentOpacity,
          },
        ]}
      >
        <View style={styles.featureList}>
          <FeatureItem
            icon="clipboard-list-outline"
            title="Manage Orders"
            description="Track and fulfill customer orders in real-time"
          />
          <FeatureItem
            icon="package-variant"
            title="Product Catalog"
            description="Add and manage your cutting products easily"
          />
          <FeatureItem
            icon="truck-delivery-outline"
            title="Delivery Tracking"
            description="Monitor deliveries and route assignments"
          />
        </View>

        <SafeAreaView edges={['bottom']} style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/login')}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Icon name="arrow-right" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.versionText, themed.textMuted]}>
            Chopify Owner v1.0.0
          </Text>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Icon name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 24,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOW.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    justifyContent: 'space-between',
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  bottomActions: {
    paddingBottom: SPACING.base,
  },
  getStartedBtn: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
    color: COLORS.text.muted,
  },
});
