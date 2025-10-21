/**
 * Redis client with connection pooling
 */

import Redis from 'ioredis'
import { logger } from '@big0290/shared'

// Lazy-loaded Redis connection
let _redis: Redis | null = null

function getRedisConnection(): Redis {
  if (!_redis) {
    const REDIS_URL = process.env.REDIS_URL

    if (!REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set')
    }

    _redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`)
        return delay
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Reconnect on READONLY error (Redis cluster failover)
          return true
        }
        return false
      },
      lazyConnect: false,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    })

    // Event handlers
    _redis.on('connect', () => {
      logger.info('Redis client connecting...')
    })

    _redis.on('ready', () => {
      logger.info('Redis client ready')
    })

    _redis.on('error', (err: Error) => {
      logger.error('Redis connection error', err)
    })

    _redis.on('close', () => {
      logger.warn('Redis connection closed')
    })

    _redis.on('reconnecting', () => {
      logger.info('Redis client reconnecting...')
    })

    _redis.on('end', () => {
      logger.warn('Redis connection ended')
    })
  }

  return _redis
}

/**
 * Redis client instance with lazy loading
 */
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisConnection()
    const value = client[prop as keyof Redis]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

/**
 * Close Redis connection
 * Should be called on application shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (_redis) {
    await _redis.quit()
    logger.info('Redis connection closed gracefully')
  }
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): {
  status: string
  ready: boolean
} {
  if (!_redis) {
    return {
      status: 'disconnected',
      ready: false,
    }
  }
  return {
    status: _redis.status,
    ready: _redis.status === 'ready',
  }
}
