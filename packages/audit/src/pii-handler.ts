/**
 * PII (Personally Identifiable Information) handler
 * Automatically detects and masks sensitive data
 */

import { logger } from '@big0290/shared'

/**
 * PII field patterns
 * Fields matching these patterns will be masked
 */
const PII_PATTERNS = [
  // Email
  /email/i,
  /e-mail/i,
  /mail/i,

  // Phone
  /phone/i,
  /mobile/i,
  /telephone/i,

  // Names
  /firstname/i,
  /lastname/i,
  /fullname/i,
  /name/i,

  // Address
  /address/i,
  /street/i,
  /city/i,
  /postal/i,
  /zipcode/i,
  /zip/i,

  // Identification
  /ssn/i,
  /social.?security/i,
  /passport/i,
  /license/i,
  /tax.?id/i,

  // Financial
  /card/i,
  /credit/i,
  /account.?number/i,
  /routing/i,
  /iban/i,
  /swift/i,

  // Health
  /medical/i,
  /health/i,
  /diagnosis/i,

  // Credentials (always mask)
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /apikey/i,
  /api.?key/i,
]

/**
 * Custom PII fields (configurable)
 */
let customPIIFields: string[] = []

/**
 * Configure custom PII fields
 */
export function configurePIIFields(fields: string[]): void {
  customPIIFields = fields
  logger.info('Custom PII fields configured', { count: fields.length })
}

/**
 * Check if field name indicates PII
 */
export function isPIIField(fieldName: string): boolean {
  // Check against patterns
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(fieldName)) {
      return true
    }
  }

  // Check against custom fields
  const lowerFieldName = fieldName.toLowerCase()
  return customPIIFields.some((field) => lowerFieldName.includes(field.toLowerCase()))
}

/**
 * Mask PII value
 */
export function maskValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    // Mask string value
    if (value.length <= 4) {
      return '***'
    }

    // Show first 2 and last 2 characters
    return `${value.substring(0, 2)}${'*'.repeat(Math.max(0, value.length - 4))}${value.substring(value.length - 2)}`
  }

  if (typeof value === 'number') {
    // Mask number (keep magnitude)
    return '***'
  }

  if (Array.isArray(value)) {
    // Mask array elements
    return value.map(maskValue)
  }

  if (typeof value === 'object') {
    // Mask object recursively
    return maskPII(value as Record<string, unknown>).data
  }

  return value
}

/**
 * Mask PII in object
 * Returns masked object and flag indicating if any PII was masked
 */
export function maskPII(obj: Record<string, unknown>): {
  data: Record<string, unknown>
  masked: boolean
} {
  let masked = false
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (isPIIField(key)) {
      result[key] = maskValue(value)
      masked = true
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively mask nested objects
      const nestedResult = maskPII(value as Record<string, unknown>)
      result[key] = nestedResult.data
      if (nestedResult.masked) {
        masked = true
      }
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const nestedResult = maskPII(item as Record<string, unknown>)
          if (nestedResult.masked) {
            masked = true
          }
          return nestedResult.data
        }
        return item
      })
    } else {
      result[key] = value
    }
  }

  return { data: result, masked }
}

/**
 * Detect email in string
 */
export function detectEmail(value: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  return emailRegex.test(value)
}

/**
 * Detect phone number in string
 */
export function detectPhone(value: string): boolean {
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  return phoneRegex.test(value)
}

/**
 * Detect credit card number in string
 */
export function detectCreditCard(value: string): boolean {
  const ccRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/
  return ccRegex.test(value)
}

/**
 * Auto-detect and mask PII in free text
 */
export function maskPIIInText(text: string): string {
  let masked = text

  // Mask emails
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')

  // Mask phone numbers
  masked = masked.replace(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]')

  // Mask credit cards
  masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')

  // Mask SSN (US format)
  masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')

  return masked
}
