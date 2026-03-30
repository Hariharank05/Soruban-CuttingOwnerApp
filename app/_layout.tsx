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
import { WalletProvider } from '@/context/WalletContext';
import { ReviewProvider } from '@/context/ReviewContext';
import { IssueProvider } from '@/context/IssueContext';
import { ReferralProvider } from '@/context/ReferralContext';
import { RecipeProvider } from '@/context/RecipeContext';
import { SupportProvider } from '@/context/SupportContext';
import { NotificationConfigProvider } from '@/context/NotificationContext';
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
          <Stack.Screen name="offers" />
          <Stack.Screen name="sales-report" />
          <Stack.Screen name="shop-profile" />
          <Stack.Screen name="loyalty" />
          <Stack.Screen name="promotions" />
          <Stack.Screen name="settlements" />
          <Stack.Screen name="staff-manage" />
          <Stack.Screen name="price-update" />
          <Stack.Screen name="nutritionist-manage" />
          <Stack.Screen name="group-subscriptions" />
          <Stack.Screen name="corporate-plans" />
          <Stack.Screen name="freshness-tracker" />
          <Stack.Screen name="wallet-manage" />
          <Stack.Screen name="reviews-manage" />
          <Stack.Screen name="issues-manage" />
          <Stack.Screen name="order-invoice" />
          <Stack.Screen name="delivery-tracking" />
          <Stack.Screen name="subscription-calendar" />
          <Stack.Screen name="vacation-manage" />
          <Stack.Screen name="referral-manage" />
          <Stack.Screen name="loyalty-tiers" />
          <Stack.Screen name="customer-analytics" />
          <Stack.Screen name="order-calendar" />
          <Stack.Screen name="recipes-manage" />
          <Stack.Screen name="notification-config" />
          <Stack.Screen name="support-tickets" />
          <Stack.Screen name="custom-packs-monitor" />
          <Stack.Screen name="b2b-manage" />
          <Stack.Screen name="kitchen-summary" />
          <Stack.Screen name="popular-products" />
          <Stack.Screen name="expense-tracker" />
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
                    <WalletProvider>
                      <ReviewProvider>
                        <IssueProvider>
                          <ReferralProvider>
                            <RecipeProvider>
                              <SupportProvider>
                                <NotificationConfigProvider>
                                  <ErrorBoundary>
                                    <RootLayoutNav />
                                  </ErrorBoundary>
                                </NotificationConfigProvider>
                              </SupportProvider>
                            </RecipeProvider>
                          </ReferralProvider>
                        </IssueProvider>
                      </ReviewProvider>
                    </WalletProvider>
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
