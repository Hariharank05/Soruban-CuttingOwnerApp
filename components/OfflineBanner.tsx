import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/src/utils/theme';

/**
 * Simple offline banner that checks connectivity by attempting a lightweight fetch.
 * Does NOT require @react-native-community/netinfo.
 */
const PING_URL = 'https://clients3.google.com/generate_204';
const CHECK_INTERVAL_MS = 15_000; // 15 seconds

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(PING_URL, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      clearTimeout(timeout);
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Periodic check
    intervalRef.current = setInterval(checkConnectivity, CHECK_INTERVAL_MS);

    // Re-check when app comes back to foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkConnectivity();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.status.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text.white,
    fontSize: FONTS.sizes.sm,
    ...FONTS.semiBold,
  },
});

export default OfflineBanner;
