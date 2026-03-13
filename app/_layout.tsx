import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import {
  ThemeProvider as NavThemeProvider,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import { OrderProvider } from '@/context/OrderContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { DeliveryProvider } from '@/context/DeliveryContext';
import { PackProvider } from '@/context/PackContext';
import { CouponProvider } from '@/context/CouponContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';

function RootLayoutNav() {
  const { isLoading, isAuthenticated } = useAuth();
  const { isDark, colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace('/(auth)' as any);
      }
    } else if (isAuthenticated && inAuthGroup) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace('/(tabs)' as any);
      }
    } else {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isLoading, segments]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text.primary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="order-detail" />
          <Stack.Screen name="product-form" />
          <Stack.Screen name="customer-detail" />
          <Stack.Screen name="customers" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="packs" />
          <Stack.Screen name="pack-form" />
          <Stack.Screen name="coupons" />
          <Stack.Screen name="coupon-form" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="subscription-detail" />
        </Stack>
      </View>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <OrderProvider>
            <SubscriptionProvider>
              <DeliveryProvider>
                <PackProvider>
                  <CouponProvider>
                    <ErrorBoundary>
                      <RootLayoutNav />
                    </ErrorBoundary>
                  </CouponProvider>
                </PackProvider>
              </DeliveryProvider>
            </SubscriptionProvider>
          </OrderProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
