/**
 * Cache utility functions
 * Provides high-level caching operations with JSON serialization
 */

import { redis } from './client.js'
import { logger } from '@sv-sdk/shared'

/**
 * Get value from cache
 * Returns null if key doesn't exist
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)

    if (data === null) {
      return null
    }

    // Parse JSON data
    return JSON.parse(data) as T
  } catch (error) {
    logger.error(`Cache get error for key: ${key}`, error as Error)
    return null
  }
}

/**
 * Set value in cache
 * Optionally set TTL in seconds
 */
export async function cacheSet<T>(key: string, value: T, ttl?: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value)

    if (ttl) {
      await redis.setex(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  } catch (error) {
    logger.error(`Cache set error for key: ${key}`, error as Error)
    throw error
  }
}

/**
 * Delete single key from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    logger.error(`Cache delete error for key: ${key}`, error as Error)
    throw error
  }
}

/**
 * Delete multiple keys matching pattern
 * Uses SCAN for safe iteration (doesn't block Redis)
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    let cursor = '0'
    let deletedCount = 0

    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)

      cursor = nextCursor

      if (keys.length > 0) {
        const deleted = await redis.del(...keys)
        deletedCount += deleted
      }
    } while (cursor !== '0')

    logger.debug(`Deleted ${deletedCount} keys matching pattern: ${pattern}`)
    return deletedCount
  } catch (error) {
    logger.error(`Cache delete pattern error for pattern: ${pattern}`, error as Error)
    throw error
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    logger.error(`Cache exists error for key: ${key}`, error as Error)
    return false
  }
}

/**
 * Get remaining TTL for key
 * Returns -1 if key exists but has no TTL
 * Returns -2 if key doesn't exist
 */
export async function cacheTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key)
  } catch (error) {
    logger.error(`Cache TTL error for key: ${key}`, error as Error)
    return -2
  }
}

/**
 * Set expiry time on existing key
 */
export async function cacheExpire(key: string, seconds: number): Promise<boolean> {
  try {
    const result = await redis.expire(key, seconds)
    return result === 1
  } catch (error) {
    logger.error(`Cache expire error for key: ${key}`, error as Error)
    return false
  }
}

/**
 * Increment numeric value
 * Returns new value
 */
export async function cacheIncrement(key: string, amount: number = 1): Promise<number> {
  try {
    return await redis.incrby(key, amount)
  } catch (error) {
    logger.error(`Cache increment error for key: ${key}`, error as Error)
    throw error
  }
}

/**
 * Decrement numeric value
 * Returns new value
 */
export async function cacheDecrement(key: string, amount: number = 1): Promise<number> {
  try {
    return await redis.decrby(key, amount)
  } catch (error) {
    logger.error(`Cache decrement error for key: ${key}`, error as Error)
    throw error
  }
}

/**
 * Get multiple keys at once
 * Returns array of values (null for missing keys)
 */
export async function cacheMultiGet<T>(keys: string[]): Promise<Array<T | null>> {
  try {
    if (keys.length === 0) {
      return []
    }

    const values = await redis.mget(...keys)

    return values.map((value) => {
      if (value === null) {
        return null
      }
      try {
        return JSON.parse(value) as T
      } catch {
        return null
      }
    })
  } catch (error) {
    logger.error('Cache multi-get error', error as Error)
    return keys.map(() => null)
  }
}

/**
 * Set multiple key-value pairs at once
 */
export async function cacheMultiSet(entries: Array<{ key: string; value: unknown; ttl?: number }>): Promise<void> {
  try {
    const pipeline = redis.pipeline()

    for (const entry of entries) {
      const serialized = JSON.stringify(entry.value)

      if (entry.ttl) {
        pipeline.setex(entry.key, entry.ttl, serialized)
      } else {
        pipeline.set(entry.key, serialized)
      }
    }

    await pipeline.exec()
  } catch (error) {
    logger.error('Cache multi-set error', error as Error)
    throw error
  }
}

/**
 * Flush all keys from cache
 * WARNING: Use with caution!
 */
export async function cacheFlush(): Promise<void> {
  try {
    await redis.flushdb()
    logger.warn('Cache flushed - all keys deleted')
  } catch (error) {
    logger.error('Cache flush error', error as Error)
    throw error
  }
}
