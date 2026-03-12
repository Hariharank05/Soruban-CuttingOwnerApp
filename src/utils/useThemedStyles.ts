import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

export function useThemedStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(() => ({
    colors,
    isDark,
    safeArea: { backgroundColor: colors.background },
    card: { backgroundColor: colors.card },
    headerGradient: colors.gradient.header as unknown as [string, string],
    heroGradient: colors.gradient.hero as unknown as [string, string],
    primaryGradient: colors.gradient.primary as unknown as [string, string],
    textPrimary: { color: colors.text.primary },
    textSecondary: { color: colors.text.secondary },
    textMuted: { color: colors.text.muted },
    textAccent: { color: colors.primary },
    borderColor: { borderColor: colors.border },
    dividerColor: { backgroundColor: colors.divider },
    inputBg: { backgroundColor: isDark ? '#2A2A2A' : '#F7F7F7', borderColor: colors.border, color: colors.text.primary },
    softBg: { backgroundColor: colors.backgroundSoft },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.backgroundSoft },
  }), [colors, isDark]);
}
