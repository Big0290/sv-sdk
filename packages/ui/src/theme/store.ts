/**
 * Theme Store - iOS 26 Glassmorphism Theme Management
 * Reactive theme switching with Svelte 5 runes
 */

import { writable, derived } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  systemTheme: ResolvedTheme
}

/**
 * Get system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get stored theme from localStorage
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch (e) {
    console.warn('Failed to read theme from localStorage:', e)
  }
  return 'system'
}

/**
 * Store theme in localStorage
 */
function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('theme', theme)
  } catch (e) {
    console.warn('Failed to write theme to localStorage:', e)
  }
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Remove old theme classes
  root.classList.remove('light', 'dark')

  // Add new theme class
  root.classList.add(resolvedTheme)

  // Set data attribute for CSS variable switching
  root.setAttribute('data-theme', resolvedTheme)

  // Update meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', resolvedTheme === 'dark' ? '#030712' : '#ffffff')
  }
}

/**
 * Create theme store
 */
function createThemeStore(): Writable<Theme> & {
  toggle: () => void
  set: (value: Theme) => void
  subscribe: (run: (value: Theme) => void) => () => void
  useSystemTheme: () => void
} {
  const initialTheme = getStoredTheme()
  const { subscribe, set, update } = writable<Theme>(initialTheme)

  // Track system theme changes
  let systemTheme = $state(getSystemTheme())

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      systemTheme = e.matches ? 'dark' : 'light'
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
  }

  // Subscribe to theme changes and apply
  subscribe((theme) => {
    const resolved = theme === 'system' ? systemTheme : theme
    applyTheme(resolved)
    storeTheme(theme)
  })

  // Apply initial theme
  const initialResolved = initialTheme === 'system' ? systemTheme : initialTheme
  applyTheme(initialResolved)

  return {
    subscribe,
    set,
    /**
     * Toggle between light and dark (ignores system)
     */
    toggle: () => {
      update((current) => {
        const resolved = current === 'system' ? systemTheme : current
        return resolved === 'light' ? 'dark' : 'light'
      })
    },
    /**
     * Use system theme preference
     */
    useSystemTheme: () => {
      set('system')
    },
  }
}

/**
 * Global theme store instance
 */
export const theme = createThemeStore()

/**
 * Derived store for resolved theme (light or dark)
 */
export const resolvedTheme: Readable<ResolvedTheme> = derived(theme, ($theme) => {
  if ($theme === 'system') {
    return getSystemTheme()
  }
  return $theme
})

/**
 * Helper to check if dark mode is active
 */
export const isDark: Readable<boolean> = derived(resolvedTheme, ($resolvedTheme) => $resolvedTheme === 'dark')

/**
 * Helper to check if light mode is active
 */
export const isLight: Readable<boolean> = derived(resolvedTheme, ($resolvedTheme) => $resolvedTheme === 'light')
