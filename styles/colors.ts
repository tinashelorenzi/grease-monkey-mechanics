// Grease Monkey Mechanics - Brand Colors for React Native

export const colors = {
  // Primary Brand Colors
  primaryBlue: '#1e3a8a',      // Dark blue from overalls
  secondaryBlue: '#3b82f6',    // Lighter blue accent
  accentBlue: '#dbeafe',       // Light blue background
  
  // Neutral Colors
  brown: '#8b4513',            // Monkey fur brown
  tan: '#d2b48c',              // Light tan
  beige: '#f5f5dc',            // Light beige background
  
  // Metal Colors
  silver: '#c0c0c0',           // Wrench silver
  darkSilver: '#a8a8a8',       // Darker silver
  
  // Text Colors
  textDark: '#1f2937',         // Dark text
  textMedium: '#6b7280',       // Medium text
  textLight: '#9ca3af',        // Light text
  textWhite: '#ffffff',        // White text
  
  // Status Colors
  success: '#10b981',          // Green for success
  warning: '#f59e0b',          // Orange for warnings
  error: '#ef4444',            // Red for errors
  info: '#3b82f6',             // Blue for info
  
  // Background Colors
  bgPrimary: '#ffffff',        // Main background
  bgSecondary: '#f9fafb',      // Secondary background
  bgAccent: '#eff6ff',         // Accent background
  
  // Border Colors
  borderLight: '#e5e7eb',      // Light borders
  borderMedium: '#d1d5db',     // Medium borders
  borderDark: '#9ca3af',       // Dark borders
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
} as const;

// Common component styles
export const commonStyles = {
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    fontWeight: fontWeight.semibold,
  },
  buttonPrimary: {
    backgroundColor: colors.primaryBlue,
    color: colors.textWhite,
  },
  buttonSecondary: {
    backgroundColor: colors.accentBlue,
    color: colors.primaryBlue,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  input: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
  },
} as const;

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
