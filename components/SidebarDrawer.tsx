import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, TouchableWithoutFeedback, Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

type MenuItem = {
  icon: string;
  label: string;
  route: string;
  color: string;
  bg: string;
  isNew?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Quick Access',
    items: [
      { icon: 'star-outline', label: 'Customer Ratings', route: '/reviews-manage', color: '#FF9800', bg: '#FFF3E0' },
      { icon: 'chart-line', label: 'Growth Buddy', route: '/customer-analytics', color: '#4CAF50', bg: '#E8F5E9', isNew: true },
      { icon: 'store', label: 'Shop Profile', route: '/shop-profile', color: '#FF6B35', bg: '#FFF0E8' },
      { icon: 'bullhorn', label: 'Promotions', route: '/promotions', color: '#FF9800', bg: '#FFF3E0' },
      { icon: 'sale', label: 'Discounts & Offers', route: '/offers', color: '#E91E63', bg: '#FCE4EC' },
      { icon: 'wallet', label: 'Payouts & Finance', route: '/settlements', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'headset', label: 'Help Centre', route: '/support-tickets', color: '#607D8B', bg: '#ECEFF1' },
      { icon: 'history', label: 'Past Orders', route: '/(tabs)/orders', color: '#7B1FA2', bg: '#F3E5F5' },
    ],
  },
  {
    title: 'Orders & Deliveries',
    items: [
      { icon: 'chef-hat', label: 'Kitchen Summary', route: '/kitchen-summary', color: '#388E3C', bg: '#E8F5E9', isNew: true },
      { icon: 'package-variant', label: 'Packs', route: '/packs', color: '#7B1FA2', bg: '#F3E5F5' },
      { icon: 'calendar-text', label: 'Order Calendar', route: '/order-calendar', color: '#388E3C', bg: '#E8F5E9' },
      { icon: 'file-document-outline', label: 'Invoice', route: '/order-invoice', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'map-marker-path', label: 'Tracking', route: '/delivery-tracking', color: '#E65100', bg: '#FFF3E0' },
    ],
  },
  {
    title: 'Subscriptions',
    items: [
      { icon: 'calendar-sync', label: 'Subscriptions', route: '/(tabs)/subscriptions', color: '#E65100', bg: '#FFF3E0' },
      { icon: 'calendar-month', label: 'Sub Calendar', route: '/subscription-calendar', color: '#7B1FA2', bg: '#F3E5F5' },
      { icon: 'account-group', label: 'Group Subs', route: '/group-subscriptions', color: '#7B1FA2', bg: '#F3E5F5', isNew: true },
      { icon: 'domain', label: 'Corporate Plans', route: '/corporate-plans', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'beach', label: 'Vacations', route: '/vacation-manage', color: '#E65100', bg: '#FFF3E0' },
    ],
  },
  {
    title: 'Marketing & Offers',
    items: [
      { icon: 'ticket-percent-outline', label: 'Coupons', route: '/coupons', color: '#C62828', bg: '#FFEBEE' },
      { icon: 'tag-multiple', label: 'Promotions', route: '/promotions', color: '#FF6B35', bg: '#FFF0E8' },
      { icon: 'account-arrow-right', label: 'Referrals', route: '/referral-manage', color: '#1565C0', bg: '#E3F2FD' },
    ],
  },
  {
    title: 'Customers & Engagement',
    items: [
      { icon: 'account-group', label: 'Customers', route: '/customers', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'gift-outline', label: 'Loyalty', route: '/loyalty', color: '#7B1FA2', bg: '#F3E5F5' },
      { icon: 'shield-star', label: 'Loyalty Tiers', route: '/loyalty-tiers', color: '#FF9800', bg: '#FFF3E0' },
      { icon: 'food-variant', label: 'Recipes', route: '/recipes-manage', color: '#E65100', bg: '#FFF3E0' },
    ],
  },
  {
    title: 'Finance & Reports',
    items: [
      { icon: 'wallet', label: 'Payments', route: '/payments', color: '#388E3C', bg: '#E8F5E9' },
      { icon: 'chart-bar', label: 'Sales Report', route: '/sales-report', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'bank-transfer', label: 'Settlements', route: '/settlements', color: '#00796B', bg: '#E0F7FA' },
      { icon: 'wallet-outline', label: 'Wallets', route: '/wallet-manage', color: '#388E3C', bg: '#E8F5E9' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: 'badge-account', label: 'Staff', route: '/staff-manage', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'tag-edit', label: 'Price Update', route: '/price-update', color: '#C62828', bg: '#FFEBEE' },
      { icon: 'leaf', label: 'Freshness Tracker', route: '/freshness-tracker', color: '#00796B', bg: '#E0F7FA' },
      { icon: 'doctor', label: 'Nutritionist', route: '/nutritionist-manage', color: '#1565C0', bg: '#E3F2FD' },
      { icon: 'package-variant-closed', label: 'Pack Trends', route: '/custom-packs-monitor', color: '#00796B', bg: '#E0F7FA' },
      { icon: 'briefcase-outline', label: 'B2B Management', route: '/b2b-manage', color: '#1A237E', bg: '#E8EAF6', isNew: true },
    ],
  },
  {
    title: 'Support & Settings',
    items: [
      { icon: 'alert-circle-outline', label: 'Issues', route: '/issues-manage', color: '#E53935', bg: '#FFEBEE' },
      { icon: 'bell-cog', label: 'Notification Config', route: '/notification-config', color: '#7B1FA2', bg: '#F3E5F5' },
      { icon: 'headset', label: 'Support Tickets', route: '/support-tickets', color: '#C62828', bg: '#FFEBEE' },
      { icon: 'cog', label: 'Settings', route: '/settings', color: '#616161', bg: '#F5F5F5' },
    ],
  },
];

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SidebarDrawer({ visible, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const themed = useThemedStyles();
  const insets = useSafeAreaInsets();
  const { owner } = useAuth();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -DRAWER_WIDTH,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 250);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: themed.colors.background,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Drawer Header */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.drawerHeader}
        >
          <View style={styles.drawerHeaderTop}>
            <View style={styles.drawerAvatar}>
              <Icon name="account" size={26} color="#FF6B35" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.drawerName}>{owner?.name || 'My Shop'}</Text>
          <Text style={styles.drawerRole}>{owner?.role || 'Owner'}</Text>
        </LinearGradient>

        {/* Menu */}
        <ScrollView
          style={styles.menuScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themed.colors.text.muted }]}>
                {section.title}
              </Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  activeOpacity={0.65}
                  onPress={() => handleItemPress(item.route)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                    <Icon name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, themed.textPrimary]}>{item.label}</Text>
                  {item.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                  <Icon name="chevron-right" size={18} color={themed.colors.text.muted} style={styles.chevron} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    ...SHADOW.lg,
    elevation: 20,
  },

  /* Header */
  drawerHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  drawerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  drawerName: {
    fontSize: 20, fontWeight: '800', color: '#FFF',
  },
  drawerRole: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2,
  },

  /* Menu */
  menuScroll: {
    flex: 1,
  },
  section: {
    paddingTop: SPACING.base,
    paddingHorizontal: SPACING.base,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1, fontSize: 14, fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#FF6B35', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  newBadgeText: { fontSize: 8, fontWeight: '800', color: '#FFF' },
  chevron: {
    marginLeft: SPACING.xs,
  },
});
