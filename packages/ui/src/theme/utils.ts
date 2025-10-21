/**
 * Theme Utilities - CSS Variable Injection & Helpers
 */

import { colors, glass, gradients, typography, spacing, borderRadius, duration, easing } from '../tokens'
import type { ResolvedTheme } from './store'

/**
 * Inject CSS variables into document root
 */
export function injectThemeVariables(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Color variables
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'string') {
      root.style.setProperty(`--color-${colorName}`, colorValue)
    } else {
      Object.entries(colorValue).forEach(([shade, hex]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, hex)
      })
    }
  })

  // Glassmorphism variables
  root.style.setProperty('--glass-blur-sm', glass.blur.sm)
  root.style.setProperty('--glass-blur-md', glass.blur.md)
  root.style.setProperty('--glass-blur-lg', glass.blur.lg)
  root.style.setProperty('--glass-blur-xl', glass.blur.xl)
  root.style.setProperty('--glass-blur-2xl', glass.blur['2xl'])

  // Gradient variables
  root.style.setProperty('--gradient-primary', gradients.primary)
  root.style.setProperty('--gradient-primary-reverse', gradients.primaryReverse)
  root.style.setProperty('--gradient-radial', gradients.radial)
  root.style.setProperty('--gradient-shimmer', gradients.shimmer)

  // Typography variables
  root.style.setProperty('--font-sans', typography.fontFamily.sans)
  root.style.setProperty('--font-mono', typography.fontFamily.mono)

  // Spacing variables
  Object.entries(spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })

  // Border radius variables
  Object.entries(borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value)
  })

  // Animation variables
  Object.entries(duration).forEach(([key, value]) => {
    root.style.setProperty(`--duration-${key}`, value)
  })

  Object.entries(easing).forEach(([key, value]) => {
    root.style.setProperty(`--ease-${key}`, value)
  })
}

/**
 * Get glass background styles based on theme
 */
export function getGlassBackground(theme: ResolvedTheme, opacity: 'subtle' | 'medium' | 'strong' = 'medium'): string {
  const opacityValue = theme === 'dark' ? glass.opacity.dark[opacity] : glass.opacity.light[opacity]

  const bgColor =
    theme === 'dark'
      ? `rgba(3, 7, 18, ${opacityValue})` // gray-950
      : `rgba(255, 255, 255, ${opacityValue})`

  return bgColor
}

/**
 * Get glass border color based on theme
 */
export function getGlassBorder(theme: ResolvedTheme): string {
  return theme === 'dark' ? glass.border.dark : glass.border.light
}

/**
 * Generate complete glass CSS properties
 */
export function getGlassStyles(
  theme: ResolvedTheme,
  options: {
    opacity?: 'subtle' | 'medium' | 'strong'
    blur?: keyof typeof glass.blur
    border?: boolean
    glow?: 'purple' | 'blue' | false
    glowSize?: 'sm' | 'md' | 'lg' | 'xl'
  } = {}
): Record<string, string> {
  const { opacity = 'medium', blur = 'lg', border = true, glow = false, glowSize = 'md' } = options

  const styles: Record<string, string> = {
    backgroundColor: getGlassBackground(theme, opacity),
    backdropFilter: `blur(${glass.blur[blur]})`,
    WebkitBackdropFilter: `blur(${glass.blur[blur]})`,
  }

  if (border) {
    styles.border = `1px solid ${getGlassBorder(theme)}`
  }

  if (glow) {
    const glowValue = glow === 'purple' ? glass.glow.purple[glowSize] : glass.glow.blue[glowSize]
    styles.boxShadow = glowValue
  }

  return styles
}

/**
 * CSS class utility for combining classes (clsx alternative)
 */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Utility type for component props with className support
 */
export type ClassNameProp = { class?: string }

/**
 * Generate gradient text CSS
 */
export function gradientText(gradient: keyof typeof gradients = 'primary'): Record<string, string> {
  return {
    background: gradients[gradient],
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }
}

/**
 * Generate pulsing glow animation
 */
export function pulsingGlow(color: 'purple' | 'blue' = 'purple'): string {
  const baseGlow = color === 'purple' ? 'rgba(164, 108, 243, 0.4)' : 'rgba(108, 76, 243, 0.4)'

  return `
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px ${baseGlow}; }
      50% { box-shadow: 0 0 40px ${baseGlow}; }
    }
  `
}

/**
 * Check if browser supports backdrop-filter
 */
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false

  return CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
}

/**
 * Get fallback background for browsers without backdrop-filter support
 */
export function getFallbackBackground(theme: ResolvedTheme): string {
  return theme === 'dark'
    ? 'rgba(3, 7, 18, 0.95)' // More opaque for fallback
    : 'rgba(255, 255, 255, 0.95)'
}

/**
 * Media query helper for responsive glassmorphism
 */
export function reducedMotionQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null
  return window.matchMedia('(prefers-reduced-motion: reduce)')
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  const query = reducedMotionQuery()
  return query ? query.matches : false
}
