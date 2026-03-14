// Owner App theme - Same fresh green + white ecosystem as Cutting App

export const COLORS = {
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  accent: '#FFA726',
  accentLight: '#FFD180',
  background: '#F9FAFB',
  backgroundSoft: '#E8F5E9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  green: '#388E3C',
  greenLight: '#E8F5E9',

  text: {
    primary: '#333333',
    secondary: '#5A6B6A',
    muted: '#94A3B8',
    white: '#FFFFFF',
    accent: '#4CAF50',
  },

  status: {
    success: '#388E3C',
    warning: '#FFA726',
    error: '#E53935',
    info: '#1E88E5',
  },

  gradient: {
    primary: ['#4CAF50', '#66BB6A'] as const,
    warm: ['#81C784', '#66BB6A'] as const,
    header: ['#E8F5E9', '#F1F8F2'] as const,
    hero: ['#388E3C', '#4CAF50'] as const,
    green: ['#4CAF50', '#388E3C'] as const,
    card: ['#FFFFFF', '#F9FAFB'] as const,
  },

  accentBg: {
    green: '#E8F5E9',
    blue: '#E3F2FD',
    purple: '#F3E5F5',
    orange: '#FFF3E0',
    red: '#FFEBEE',
    gray: '#F5F5F5',
    cyan: '#E0F7FA',
  },
};

export const FONTS = {
  extraBold: { fontWeight: '800' as const },
  bold: { fontWeight: '700' as const },
  semiBold: { fontWeight: '600' as const },
  medium: { fontWeight: '500' as const },
  regular: { fontWeight: '400' as const },
  sizes: { xs: 10, sm: 12, md: 14, base: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30 },
};

export const SPACING = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48 };

export const RADIUS = { sm: 6, md: 10, lg: 16, xl: 24, full: 999 };

export const SHADOW = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 8 },
  floating: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
};
