/**
 * Internationalization hooks for UI components
 */

import { writable, derived } from 'svelte/store'

export type Locale = 'en' | 'es' | 'fr' | 'de'

interface Translations {
  [key: string]: {
    [locale in Locale]: string
  }
}

const translations: Translations = {
  'button.loading': {
    en: 'Loading...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Wird geladen...',
  },
  'button.submit': {
    en: 'Submit',
    es: 'Enviar',
    fr: 'Soumettre',
    de: 'Absenden',
  },
  'button.cancel': {
    en: 'Cancel',
    es: 'Cancelar',
    fr: 'Annuler',
    de: 'Abbrechen',
  },
  'input.required': {
    en: 'Required',
    es: 'Requerido',
    fr: 'Requis',
    de: 'Erforderlich',
  },
  'modal.close': {
    en: 'Close',
    es: 'Cerrar',
    fr: 'Fermer',
    de: 'Schließen',
  },
}

export const currentLocale = writable<Locale>('en')

export function t(key: string, locale?: Locale): string {
  let currentLoc: Locale = 'en'

  if (!locale) {
    currentLocale.subscribe((val) => (currentLoc = val))()
  } else {
    currentLoc = locale
  }

  return translations[key]?.[currentLoc] || key
}

export function setLocale(locale: Locale) {
  currentLocale.set(locale)
}

