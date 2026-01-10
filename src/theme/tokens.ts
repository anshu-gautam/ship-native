/**
 * Design System Tokens
 *
 * Centralized design tokens for consistent styling across the app.
 * Based on Material Design and iOS Human Interface Guidelines.
 */

import { Easing } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Color Palette
 */
export const colors = {
  // Primary brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Main
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },

  // Neutral grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic colors
  semantic: {
    success: {
      light: '#81C784',
      main: '#4CAF50',
      dark: '#388E3C',
    },
    warning: {
      light: '#FFB74D',
      main: '#FF9800',
      dark: '#F57C00',
    },
    error: {
      light: '#E57373',
      main: '#F44336',
      dark: '#D32F2F',
    },
    info: {
      light: '#64B5F6',
      main: '#2196F3',
      dark: '#1976D2',
    },
  },

  // Dark mode colors
  dark: {
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2C2C2C',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#E0E0E0',
      tertiary: '#9E9E9E',
    },
    border: '#616161',
  },
} as const;

/**
 * Typography
 */
export const fonts = {
  heading: 'Inter-Bold',
  body: 'Inter-Regular',
  mono: 'Menlo',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/**
 * Spacing
 * Based on 4px base unit
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Shadows
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Icon Sizes
 */
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

/**
 * Animation Duration (milliseconds)
 */
export const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Animation Easing
 */
export const easing = {
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: Easing.elastic(1),
} as const;

/**
 * Breakpoints
 */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Container Widths
 */
export const containerWidth = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: '100%',
} as const;

/**
 * Touch Target Sizes
 */
export const touchTarget = {
  ios: 44,
  android: 48,
  default: 44,
} as const;

/**
 * Pre-defined text styles
 */
export const textStyles = {
  h1: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,

  h2: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,

  h3: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,

  h4: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  } as TextStyle,

  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,

  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,

  caption: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,

  button: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md,
  } as TextStyle,

  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
} as const;

/**
 * Button styles
 */
export const buttonStyles = {
  sizes: {
    sm: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      fontSize: fontSizes.sm,
      minHeight: touchTarget.default,
    },
    md: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      fontSize: fontSizes.md,
      minHeight: touchTarget.default,
    },
    lg: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[8],
      fontSize: fontSizes.lg,
      minHeight: touchTarget.default,
    },
  },

  variants: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.md,
    } as ViewStyle,

    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary[500],
      borderRadius: borderRadius.md,
    } as ViewStyle,

    text: {
      backgroundColor: 'transparent',
    } as ViewStyle,
  },
} as const;

/**
 * Input styles
 */
export const inputStyles = {
  default: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: fontSizes.md,
    color: colors.neutral[900],
    minHeight: touchTarget.default,
  } as ViewStyle & TextStyle,

  focused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  } as ViewStyle,

  error: {
    borderColor: colors.semantic.error.main,
  } as ViewStyle,

  disabled: {
    backgroundColor: colors.neutral[100],
    color: colors.neutral[400],
  } as ViewStyle & TextStyle,
} as const;

/**
 * Card styles
 */
export const cardStyles = {
  default: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.md,
  } as ViewStyle,

  elevated: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.lg,
  } as ViewStyle,

  outlined: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  } as ViewStyle,
} as const;

/**
 * Export all tokens
 */
export const tokens = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  iconSizes,
  duration,
  easing,
  breakpoints,
  containerWidth,
  touchTarget,
  textStyles,
  buttonStyles,
  inputStyles,
  cardStyles,
} as const;

export default tokens;
