/**
 * Redis-backed rate limiter
 * Implements sliding window rate limiting
 */

import { redis, CACHE_KEYS } from '@sv-sdk/cache'
import { RateLimitError, logger } from '@sv-sdk/shared'

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number

  /**
   * Time window in milliseconds
   */
  windowMs: number

  /**
   * Identifier for rate limiting (IP, user ID, etc.)
   */
  identifier: string

  /**
   * Optional endpoint/resource identifier
   */
  resource?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether request is allowed
   */
  allowed: boolean

  /**
   * Current number of requests in window
   */
  current: number

  /**
   * Maximum requests allowed
   */
  limit: number

  /**
   * Remaining requests
   */
  remaining: number

  /**
   * Timestamp when limit resets (Unix timestamp in seconds)
   */
  resetAt: number

  /**
   * Seconds until reset
   */
  retryAfter?: number
}

/**
 * Check rate limit
 * Uses Redis with sliding window algorithm
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier, resource = 'default' } = config

  try {
    const key = CACHE_KEYS.build('rate_limit', resource, identifier)
    const now = Date.now()
    const windowStart = now - windowMs

    // Use Redis sorted set for sliding window
    // Score = timestamp, value = unique request ID
    const requestId = `${now}-${Math.random()}`

    // Remove old entries outside window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count current requests in window
    const current = await redis.zcard(key)

    // Check if limit exceeded
    const allowed = current < maxRequests

    if (allowed) {
      // Add current request to set
      await redis.zadd(key, now, requestId)

      // Set expiry on key (window + buffer)
      await redis.expire(key, Math.ceil(windowMs / 1000) + 10)
    }

    // Calculate reset time
    const resetAt = Math.ceil((now + windowMs) / 1000)

    const result: RateLimitResult = {
      allowed,
      current: allowed ? current + 1 : current,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - (allowed ? current + 1 : current)),
      resetAt,
    }

    if (!allowed) {
      result.retryAfter = Math.ceil(windowMs / 1000)
    }

    return result
  } catch (error) {
    logger.error('Rate limit check failed', error as Error)
    // Fail open - allow request on error to prevent blocking all traffic
    return {
      allowed: true,
      current: 0,
      limit: maxRequests,
      remaining: maxRequests,
      resetAt: Math.ceil((Date.now() + windowMs) / 1000),
    }
  }
}

/**
 * Check rate limit and throw error if exceeded
 */
export async function enforceRateLimit(config: RateLimitConfig): Promise<void> {
  const result = await checkRateLimit(config)

  if (!result.allowed) {
    throw new RateLimitError('Rate limit exceeded', {
      limit: result.limit,
      window: config.windowMs,
      retryAfter: result.retryAfter,
      details: {
        current: result.current,
        remaining: result.remaining,
        resetAt: result.resetAt,
      },
    })
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
    ...(result.retryAfter && { 'Retry-After': String(result.retryAfter) }),
  }
}

/**
 * Reset rate limit for identifier
 */
export async function resetRateLimit(identifier: string, resource: string = 'default'): Promise<void> {
  const key = CACHE_KEYS.build('rate_limit', resource, identifier)

  try {
    await redis.del(key)
    logger.info(`Rate limit reset for ${identifier} on ${resource}`)
  } catch (error) {
    logger.error('Failed to reset rate limit', error as Error)
    throw error
  }
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  /**
   * Login attempts: 5 per 15 minutes
   */
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },

  /**
   * Password reset: 3 per hour
   */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * Signup: 3 per hour per IP
   */
  SIGNUP: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * API calls: 100 per 15 minutes
   */
  API: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000,
  },

  /**
   * Email sending: 10 per minute
   */
  EMAIL_SEND: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
} as const
