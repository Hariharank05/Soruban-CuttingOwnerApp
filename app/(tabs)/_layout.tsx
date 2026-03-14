import React from 'react';
import { Tabs } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/src/utils/theme';
import { useTheme } from '@/context/ThemeContext';
import { useOrders } from '@/context/OrderContext';
import { TabBarProvider, useTabBar } from '@/context/TabBarContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { translateY } = useTabBar();
  const tabBarHeight = 60 + Math.max(insets.bottom, 8);

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          transform: [{ translateY }],
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        // Skip hidden tabs (subscriptions is navigable but not a visible tab)
        if (route.name === 'subscriptions') return null;
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.text.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const icon = options.tabBarIcon?.({
          focused: isFocused,
          color,
          size: 24,
        });

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {icon}
            <Text
              style={[
                styles.tabLabel,
                { color },
                isFocused && styles.tabLabelActive,
              ]}
            >
              {label}
            </Text>
            {isFocused && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { orders } = useOrders();
  const { colors } = useTheme();
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <TabBarProvider>
      <View style={styles.flex}>
        <Tabs
          tabBar={(props) => <AnimatedTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color, size }) => (
                <View>
                  <Icon name="clipboard-list" size={size} color={color} />
                  {pendingCount > 0 && (
                    <View style={[styles.badge, { borderColor: colors.card }]}>
                      <Text style={styles.badgeText}>
                        {pendingCount}
                      </Text>
                    </View>
                  )}
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="products"
            options={{
              title: 'Products',
              tabBarIcon: ({ color, size }) => (
                <Icon name="package-variant" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="deliveries"
            options={{
              title: 'Deliveries',
              tabBarIcon: ({ color, size }) => (
                <Icon name="truck-delivery" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: 'More',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account-circle-outline" size={size} color={color} />
              ),
            }}
          />
          {/* Subscriptions accessible via navigation but hidden from tab bar */}
          <Tabs.Screen
            name="subscriptions"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </TabBarProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.status.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
