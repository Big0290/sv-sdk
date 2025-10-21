/**
 * Internationalization hooks for UI components
 */

import { writable } from 'svelte/store'
import { translations, type Locale, isRTL } from './translations.js'

export type { Locale } from './translations.js'
export { translations, isRTL } from './translations.js'

export const currentLocale = writable<Locale>('en')

/**
 * Translate a key
 */
export function t(key: string, locale?: Locale): string {
  let currentLoc: Locale = 'en'

  if (!locale) {
    currentLocale.subscribe((val) => (currentLoc = val))()
  } else {
    currentLoc = locale
  }

  return translations[key]?.[currentLoc] || key
}

/**
 * Set current locale
 */
export function setLocale(locale: Locale) {
  currentLocale.set(locale)

  // Apply RTL if needed
  if (isRTL(locale)) {
    document.documentElement.dir = 'rtl'
  } else {
    document.documentElement.dir = 'ltr'
  }
}
