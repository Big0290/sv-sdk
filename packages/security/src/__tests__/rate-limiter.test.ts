/**
 * Tests for rate limiter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { rateLimiter } from '../rate-limiter.js'

describe('RateLimiter', () => {
  const testKey = 'test-key'

  afterEach(async () => {
    // Clean up test keys
    await rateLimiter.resetLimit(testKey)
  })

  it('should allow requests within limit', async () => {
    const result = await rateLimiter.checkLimit(testKey, {
      max: 5,
      windowMs: 60000,
    })

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should deny requests exceeding limit', async () => {
    const options = { max: 2, windowMs: 60000 }

    // Make requests up to limit
    await rateLimiter.checkLimit(testKey, options)
    await rateLimiter.checkLimit(testKey, options)

    // Next request should be denied
    const result = await rateLimiter.checkLimit(testKey, options)

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset count after window expires', async () => {
    const options = { max: 1, windowMs: 100 } // 100ms window

    // Use up the limit
    await rateLimiter.checkLimit(testKey, options)

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should be allowed again
    const result = await rateLimiter.checkLimit(testKey, options)

    expect(result.allowed).toBe(true)
  })

  it('should track remaining requests correctly', async () => {
    const options = { max: 3, windowMs: 60000 }

    let result = await rateLimiter.checkLimit(testKey, options)
    expect(result.remaining).toBe(2)

    result = await rateLimiter.checkLimit(testKey, options)
    expect(result.remaining).toBe(1)

    result = await rateLimiter.checkLimit(testKey, options)
    expect(result.remaining).toBe(0)
  })
})

