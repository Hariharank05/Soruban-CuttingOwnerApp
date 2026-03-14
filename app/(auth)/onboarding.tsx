import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, RADIUS } from '@/src/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'clipboard-list-outline' as const,
    title: 'Manage Orders',
    subtitle: 'Track and fulfill customer orders in real-time. View order details, cutting instructions, and delivery status all in one place.',
    bg: ['#388E3C', '#4CAF50'] as const,
    dark: false,
  },
  {
    id: '2',
    icon: 'package-variant' as const,
    title: 'Product & Pack Catalog',
    subtitle: 'Add products, create dish packs, manage pricing and stock levels. Keep your catalog fresh and up-to-date.',
    bg: ['#E8F5E9', '#F1F8F2'] as const,
    dark: true,
  },
  {
    id: '3',
    icon: 'truck-delivery-outline' as const,
    title: 'Delivery Tracking',
    subtitle: 'Assign drivers, monitor live deliveries, and ensure every order reaches the customer on time.',
    bg: ['#FFA726', '#FFB74D'] as const,
    dark: true,
  },
  {
    id: '4',
    icon: 'chart-line' as const,
    title: 'Business Insights',
    subtitle: 'View revenue, order trends, customer analytics, and subscription metrics to grow your business smarter.',
    bg: ['#4CAF50', '#66BB6A'] as const,
    dark: false,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themed = useThemedStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => router.replace('/(auth)/login');

  return (
    <View style={[styles.container, themed.safeArea]}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.bg} style={styles.slide}>
            <Icon name={item.icon} size={80} color={item.dark ? COLORS.primary : '#FFF'} style={{ marginBottom: 32 }} />
            <Text style={[styles.title, item.dark && styles.titleDark]}>{item.title}</Text>
            <Text style={[styles.subtitle, item.dark && styles.subtitleDark]}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />
      <View style={[styles.footer, themed.card, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} style={styles.nextBtn}>
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: '#FFF',
    textAlign: 'center', lineHeight: 36, marginBottom: 16,
  },
  titleDark: { color: COLORS.text.primary },
  subtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 24,
  },
  subtitleDark: { color: 'rgba(31,31,31,0.7)' },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD', marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { padding: 12 },
  skipText: { color: COLORS.text.muted, fontSize: 15, fontWeight: '600' },
  nextBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  nextText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
