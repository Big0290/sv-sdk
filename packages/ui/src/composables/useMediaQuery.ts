/**
 * useMediaQuery - Responsive breakpoint detection
 */

import { writable } from 'svelte/store'

export function useMediaQuery(query: string) {
  const matches = writable(false)

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia(query)
    matches.set(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => matches.set(e.matches)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
    }
  }

  return matches
}

export function useBreakpoint() {
  return {
    sm: useMediaQuery('(min-width: 640px)'),
    md: useMediaQuery('(min-width: 768px)'),
    lg: useMediaQuery('(min-width: 1024px)'),
    xl: useMediaQuery('(min-width: 1280px)'),
    '2xl': useMediaQuery('(min-width: 1536px)'),
  }
}
