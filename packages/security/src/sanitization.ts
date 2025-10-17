/**
 * Input sanitization utilities
 * Prevents XSS, SQL injection, path traversal, etc.
 */

import { logger } from '@sv-sdk/shared'

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - for production, use DOMPurify
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize for SQL LIKE queries
 * Escapes special LIKE characters: %, _, \
 */
export function sanitizeSQLLike(input: string): string {
  if (!input) return input

  return input.replace(/[%_\\]/g, '\\$&').trim()
}

/**
 * Prevent path traversal attacks
 * Removes ../ and .\ patterns
 */
export function sanitizePath(input: string): string {
  if (!input) return input

  return input
    .replace(/\.\./g, '')
    .replace(/[\/\\]+/g, '/')
    .replace(/^\/+/, '')
}

/**
 * Sanitize filename
 * Removes directory traversal and special characters
 */
export function sanitizeFilename(input: string): string {
  if (!input) return input

  return input
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255) // Max filename length
}

/**
 * Detect potential XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers (onclick, onerror, etc.)
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      logger.warn('Potential XSS detected', { pattern: pattern.toString() })
      return true
    }
  }

  return false
}

/**
 * Detect potential SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b)\s+['"]\d+['"]\s*=\s*['"]\d+['"]/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+\w+\s+SET/i,
    /--/,
    /;.*DROP/i,
    /;.*DELETE/i,
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      logger.warn('Potential SQL injection detected', { pattern: pattern.toString() })
      return true
    }
  }

  return false
}

/**
 * Strip HTML tags
 */
export function stripHtmlTags(input: string): string {
  if (!input) return input

  return input.replace(/<[^>]*>/g, '')
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  if (!input) return input

  return input.replace(/\s+/g, ' ').trim()
}

/**
 * Truncate string to max length
 */
export function truncate(input: string, maxLength: number, suffix: string = '...'): string {
  if (!input) return input

  if (input.length <= maxLength) {
    return input
  }

  return input.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Sanitize user input (comprehensive)
 * Applies multiple sanitization techniques
 */
export function sanitizeUserInput(input: string, options: { allowHtml?: boolean } = {}): string {
  if (!input) return input

  let sanitized = input

  // Normalize whitespace
  sanitized = normalizeWhitespace(sanitized)

  // Remove HTML if not allowed
  if (!options.allowHtml) {
    sanitized = stripHtmlTags(sanitized)
  } else {
    // Sanitize HTML to prevent XSS
    sanitized = sanitizeHtml(sanitized)
  }

  return sanitized
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(input: string): string {
  if (!input) return input

  return input.toLowerCase().trim()
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(input: string, allowedProtocols: string[] = ['http', 'https']): string | null {
  if (!input) return null

  try {
    const url = new URL(input)

    // Check protocol
    if (!allowedProtocols.includes(url.protocol.replace(':', ''))) {
      logger.warn('Invalid URL protocol', { protocol: url.protocol })
      return null
    }

    // Block dangerous protocols
    if (/^(javascript|data|vbscript|file):/i.test(input)) {
      logger.warn('Dangerous URL protocol detected')
      return null
    }

    return url.toString()
  } catch {
    logger.warn('Invalid URL', { input })
    return null
  }
}
