/**
 * CSRF (Cross-Site Request Forgery) protection
 * Implements double-submit cookie pattern
 */

import { nanoid } from 'nanoid'
import { cacheSet, cacheGet, cacheDelete, CACHE_TTL } from '@sv-sdk/cache'
import { AuthenticationError, logger } from '@sv-sdk/shared'

/**
 * CSRF token options
 */
export interface CSRFTokenOptions {
  /**
   * Token length (default: 32)
   */
  length?: number

  /**
   * Token TTL in seconds (default: 1 hour)
   */
  ttl?: number

  /**
   * Session identifier to bind token to
   */
  sessionId?: string
}

/**
 * Generate CSRF token
 */
export async function generateCSRFToken(options: CSRFTokenOptions = {}): Promise<string> {
  const { length = 32, ttl = CACHE_TTL.LONG, sessionId } = options

  const token = nanoid(length)

  // Store token in Redis with session binding if provided
  const cacheKey = `csrf:${token}`

  await cacheSet(
    cacheKey,
    {
      token,
      sessionId,
      createdAt: new Date().toISOString(),
    },
    ttl
  )

  logger.debug('CSRF token generated', { token: token.substring(0, 8) + '...', sessionId })

  return token
}

/**
 * Verify CSRF token
 */
export async function verifyCSRFToken(token: string, sessionId?: string): Promise<boolean> {
  if (!token) {
    return false
  }

  try {
    const cacheKey = `csrf:${token}`
    const storedData = await cacheGet<{
      token: string
      sessionId?: string
      createdAt: string
    }>(cacheKey)

    if (!storedData) {
      logger.warn('CSRF token not found or expired')
      return false
    }

    // Verify session binding if provided
    if (sessionId && storedData.sessionId && storedData.sessionId !== sessionId) {
      logger.warn('CSRF token session mismatch')
      return false
    }

    // Token is valid - delete it (one-time use)
    await cacheDelete(cacheKey)

    logger.debug('CSRF token verified successfully')
    return true
  } catch (error) {
    logger.error('CSRF token verification error', error as Error)
    return false
  }
}

/**
 * Verify CSRF token and throw error if invalid
 */
export async function enforceCSRF(token: string, sessionId?: string): Promise<void> {
  const isValid = await verifyCSRFToken(token, sessionId)

  if (!isValid) {
    throw new AuthenticationError('Invalid or expired CSRF token', {
      code: 'CSRF_TOKEN_INVALID',
    })
  }
}

/**
 * Cookie configuration for CSRF protection
 */
export const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 3600, // 1 hour in seconds
}

/**
 * Get CSRF cookie name
 */
export function getCSRFCookieName(): string {
  return 'sv-sdk-csrf'
}

/**
 * Get CSRF header name
 */
export function getCSRFHeaderName(): string {
  return 'X-CSRF-Token'
}
