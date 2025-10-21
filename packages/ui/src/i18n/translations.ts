/**
 * Translation strings for UI components
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ar'

export interface Translations {
  [key: string]: {
    [locale in Locale]: string
  }
}

export const translations: Translations = {
  // Button
  'button.loading': {
    en: 'Loading...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Wird geladen...',
    ar: 'جار التحميل...',
  },
  'button.submit': {
    en: 'Submit',
    es: 'Enviar',
    fr: 'Soumettre',
    de: 'Absenden',
    ar: 'إرسال',
  },
  'button.cancel': {
    en: 'Cancel',
    es: 'Cancelar',
    fr: 'Annuler',
    de: 'Abbrechen',
    ar: 'إلغاء',
  },

  // Form
  'form.required': {
    en: 'Required',
    es: 'Requerido',
    fr: 'Requis',
    de: 'Erforderlich',
    ar: 'مطلوب',
  },
  'form.optional': {
    en: 'Optional',
    es: 'Opcional',
    fr: 'Facultatif',
    de: 'Optional',
    ar: 'اختياري',
  },

  // Modal
  'modal.close': {
    en: 'Close',
    es: 'Cerrar',
    fr: 'Fermer',
    de: 'Schließen',
    ar: 'إغلاق',
  },

  // Pagination
  'pagination.previous': {
    en: 'Previous',
    es: 'Anterior',
    fr: 'Précédent',
    de: 'Zurück',
    ar: 'السابق',
  },
  'pagination.next': {
    en: 'Next',
    es: 'Siguiente',
    fr: 'Suivant',
    de: 'Weiter',
    ar: 'التالي',
  },

  // Alerts
  'alert.success': {
    en: 'Success',
    es: 'Éxito',
    fr: 'Succès',
    de: 'Erfolg',
    ar: 'نجح',
  },
  'alert.error': {
    en: 'Error',
    es: 'Error',
    fr: 'Erreur',
    de: 'Fehler',
    ar: 'خطأ',
  },
}

/**
 * RTL languages
 */
export const RTL_LOCALES: Locale[] = ['ar']

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}
