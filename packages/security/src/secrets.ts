/**
 * Secrets management and environment variable validation
 */

import { logger } from '@sv-sdk/shared'
import crypto from 'crypto'

/**
 * Required environment variables
 */
export const REQUIRED_ENV_VARS = ['DATABASE_URL', 'REDIS_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const

/**
 * Sensitive environment variable keys
 * These will be redacted in logs
 */
export const SENSITIVE_ENV_KEYS = [
  'DATABASE_URL',
  'REDIS_URL',
  'REDIS_PASSWORD',
  'DB_PASSWORD',
  'BETTER_AUTH_SECRET',
  'BREVO_API_KEY',
  'BREVO_WEBHOOK_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'SENTRY_DSN',
] as const

/**
 * Validate required environment variables
 */
export function validateRequiredEnvVars(): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing })
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Redact sensitive value
 */
export function redactSecret(value: string): string {
  if (!value) return value

  const length = value.length

  if (length <= 4) {
    return '***'
  }

  // Show first 2 and last 2 characters
  return `${value.substring(0, 2)}${'*'.repeat(Math.max(0, length - 4))}${value.substring(length - 2)}`
}

/**
 * Redact sensitive data from object
 * Useful for logging
 */
export function redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()

    // Check if key is sensitive
    const isSensitive = SENSITIVE_ENV_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey.toLowerCase()))

    if (isSensitive && typeof value === 'string') {
      redacted[key] = redactSecret(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitiveData(value as Record<string, unknown>)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Encryption utilities for sensitive database fields
 */
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // Ensure key is correct length
  return Buffer.from(key.padEnd(KEY_LENGTH, '0').substring(0, KEY_LENGTH))
}

/**
 * Encrypt sensitive data
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return: iv + authTag + encrypted (all hex encoded)
    return iv.toString('hex') + authTag.toString('hex') + encrypted
  } catch (error) {
    logger.error('Encryption failed', error as Error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encrypted: string): string {
  try {
    const key = getEncryptionKey()

    // Extract components
    const iv = Buffer.from(encrypted.substring(0, IV_LENGTH * 2), 'hex')
    const authTag = Buffer.from(encrypted.substring(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), 'hex')
    const ciphertext = encrypted.substring((IV_LENGTH + AUTH_TAG_LENGTH) * 2)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    logger.error('Decryption failed', error as Error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash sensitive data (one-way)
 * Use for data that only needs comparison, not retrieval
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Validate minimum secret length
 */
export function validateSecretLength(secret: string, minLength: number = 32): boolean {
  return secret.length >= minLength
}
