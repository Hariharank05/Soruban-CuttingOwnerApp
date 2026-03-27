import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/src/utils/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'store' as const,
    title: 'Welcome to Soruban Owner',
    description: 'Manage your cutting business with ease. Track orders, products, and deliveries in one place.',
  },
  {
    icon: 'clipboard-list' as const,
    title: 'Manage Orders',
    description: 'Accept orders, assign drivers, and track deliveries in real-time. Never miss an order.',
  },
  {
    icon: 'package-variant' as const,
    title: 'Products & Packs',
    description: 'Add products, create dish packs, set prices, and manage your inventory effortlessly.',
  },
  {
    icon: 'chart-line' as const,
    title: 'Grow Your Business',
    description: 'Track sales, manage subscriptions, engage customers with loyalty programs and promotions.',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleGetStarted = () => {
    router.replace('/(auth)/login');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
      <LinearGradient colors={['#388E3C', '#4CAF50']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Slides */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {slides.map((slide, index) => (
              <View key={index} style={styles.slide}>
                <View style={styles.iconCircle}>
                  <Icon name={slide.icon} size={60} color="#388E3C" />
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Dot indicators */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Bottom button */}
          <TouchableOpacity
            style={styles.button}
            onPress={isLastSlide ? handleGetStarted : handleNext}
          >
            <Text style={styles.buttonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    color: COLORS.text.white,
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.9,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    flex: 1,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.text.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.white,
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  description: {
    fontSize: 15,
    color: COLORS.text.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.base,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: RADIUS.full,
    marginHorizontal: SPACING.xs,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.text.white,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  button: {
    backgroundColor: COLORS.text.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#388E3C',
    fontSize: 17,
    fontWeight: '700',
  },
});
