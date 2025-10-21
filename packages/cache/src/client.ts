/**
 * Redis client with connection pooling
 */

import Redis from 'ioredis'
import { logger } from '@big0290/shared'

// Get Redis URL from environment
const REDIS_URL = process.env.REDIS_URL

if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set')
}

/**
 * Redis client instance with retry strategy and error handling
 */
export const redis = new Redis(REDIS_URL, {
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
redis.on('connect', () => {
  logger.info('Redis client connecting...')
})

redis.on('ready', () => {
  logger.info('Redis client ready')
})

redis.on('error', (err: Error) => {
  logger.error('Redis connection error', err)
})

redis.on('close', () => {
  logger.warn('Redis connection closed')
})

redis.on('reconnecting', () => {
  logger.info('Redis client reconnecting...')
})

redis.on('end', () => {
  logger.warn('Redis connection ended')
})

/**
 * Close Redis connection
 * Should be called on application shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  await redis.quit()
  logger.info('Redis connection closed gracefully')
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): {
  status: string
  ready: boolean
} {
  return {
    status: redis.status,
    ready: redis.status === 'ready',
  }
}
