/**
 * Design tokens - iOS 26 Glassmorphism Edition
 * Centralized design values for consistency
 */

/**
 * Color system - iOS 26 Purple/Blue Liquid Gradient
 */
export const colors = {
  // iOS 26 Liquid Purple - Primary Brand
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#ead5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#A46CF3', // iOS 26 Main Purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  // iOS 26 Deep Purple - Gradient End
  accent: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#6C4CF3', // iOS 26 Deep Purple
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const

/**
 * Glassmorphism design tokens
 */
export const glass = {
  // Background opacity levels
  opacity: {
    light: {
      subtle: '0.6',
      medium: '0.7',
      strong: '0.85',
    },
    dark: {
      subtle: '0.3',
      medium: '0.5',
      strong: '0.7',
    },
  },
  // Backdrop blur amounts
  blur: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
  },
  // Border styles
  border: {
    light: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(255, 255, 255, 0.1)',
  },
  // Glow effects
  glow: {
    purple: {
      sm: '0 0 10px rgba(164, 108, 243, 0.3)',
      md: '0 0 20px rgba(164, 108, 243, 0.4)',
      lg: '0 0 30px rgba(164, 108, 243, 0.5)',
      xl: '0 0 40px rgba(164, 108, 243, 0.6)',
    },
    blue: {
      sm: '0 0 10px rgba(108, 76, 243, 0.3)',
      md: '0 0 20px rgba(108, 76, 243, 0.4)',
      lg: '0 0 30px rgba(108, 76, 243, 0.5)',
    },
  },
} as const

/**
 * Gradient definitions
 */
export const gradients = {
  primary: 'linear-gradient(145deg, #A46CF3, #6C4CF3)',
  primaryReverse: 'linear-gradient(145deg, #6C4CF3, #A46CF3)',
  radial: 'radial-gradient(circle, #A46CF3, #6C4CF3)',
  shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
} as const

/**
 * Typography scale - iOS 26 Font Stack
 */
export const typography = {
  fontFamily: {
    sans: '"SF Pro Rounded", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    mono: '"SF Mono", "JetBrains Mono", Monaco, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

/**
 * Spacing scale
 */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const

/**
 * Border radius values
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  default: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const

/**
 * Shadow system
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  none: 'none',
} as const

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

/**
 * Breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Animation durations
 */
export const duration = {
  instant: '100ms',
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const

/**
 * Animation easings - iOS 26 Spring Effects
 */
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // iOS-style spring easings
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  springBouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Liquid/smooth easings
  liquid: 'cubic-bezier(0.23, 1, 0.32, 1)',
  smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
} as const
