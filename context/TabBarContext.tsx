import React, { createContext, useContext, useRef, useCallback } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface TabBarContextType {
  translateY: Animated.Value;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarContext = createContext<TabBarContextType | null>(null);

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isHidden = useRef(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastOffsetY.current;

    // Only react after scrolling past a threshold to avoid jitter
    if (currentY <= 10) {
      // At the top — always show
      if (isHidden.current) {
        isHidden.current = false;
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      }
    } else if (diff > 8 && !isHidden.current) {
      // Scrolling up (content moving up) — hide tab bar
      isHidden.current = true;
      Animated.spring(translateY, {
        toValue: 100,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (diff < -8 && isHidden.current) {
      // Scrolling down (content moving down) — show tab bar
      isHidden.current = false;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }

    lastOffsetY.current = currentY;
  }, [translateY]);

  return (
    <TabBarContext.Provider value={{ translateY, handleScroll }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const ctx = useContext(TabBarContext);
  if (!ctx) throw new Error('useTabBar must be used within TabBarProvider');
  return ctx;
}
