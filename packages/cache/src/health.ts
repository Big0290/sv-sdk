/**
 * Redis health check utilities
 */

import { redis, getRedisStatus } from './client.js'
import { logger } from '@sv-sdk/shared'

export interface RedisHealthResult {
  healthy: boolean
  status: string
  latency?: number
  memory?: {
    used: string
    peak: string
    fragmentation: string
  }
  connectedClients?: number
  error?: string
}

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<RedisHealthResult> {
  try {
    const status = getRedisStatus()

    if (!status.ready) {
      return {
        healthy: false,
        status: status.status,
        error: 'Redis client not ready',
      }
    }

    // Measure latency with PING
    const start = Date.now()
    const pong = await redis.ping()
    const latency = Date.now() - start

    if (pong !== 'PONG') {
      return {
        healthy: false,
        status: status.status,
        error: 'Redis PING failed',
      }
    }

    // Get server info (optional, for detailed health check)
    let memory: RedisHealthResult['memory']
    let connectedClients: number | undefined

    try {
      const info = await redis.info('memory')
      const clientInfo = await redis.info('clients')

      // Parse memory info
      const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim()
      const peakMemory = info.match(/used_memory_peak_human:(.+)/)?.[1]?.trim()
      const fragmentation = info.match(/mem_fragmentation_ratio:(.+)/)?.[1]?.trim()

      if (usedMemory && peakMemory && fragmentation) {
        memory = {
          used: usedMemory,
          peak: peakMemory,
          fragmentation: fragmentation,
        }
      }

      // Parse clients info
      const clients = clientInfo.match(/connected_clients:(.+)/)?.[1]?.trim()
      if (clients) {
        connectedClients = parseInt(clients, 10)
      }
    } catch (error) {
      // Info parsing failed, but Redis is still healthy
      logger.warn('Failed to parse Redis info', error as Error)
    }

    return {
      healthy: true,
      status: status.status,
      latency,
      memory,
      connectedClients,
    }
  } catch (error) {
    logger.error('Redis health check failed', error as Error)

    return {
      healthy: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Detailed Redis health check with additional metrics
 */
export async function checkRedisHealthDetailed(): Promise<{
  healthy: boolean
  checks: {
    connection: boolean
    latency: boolean
    memory: boolean
  }
  metrics: {
    latency?: number
    memoryUsed?: string
    memoryPeak?: string
    connectedClients?: number
  }
  errors: string[]
}> {
  const errors: string[] = []
  const checks = {
    connection: false,
    latency: false,
    memory: false,
  }
  const metrics: {
    latency?: number
    memoryUsed?: string
    memoryPeak?: string
    connectedClients?: number
  } = {}

  try {
    // Check connection
    const status = getRedisStatus()
    checks.connection = status.ready

    if (!checks.connection) {
      errors.push('Redis connection not ready')
      return { healthy: false, checks, metrics, errors }
    }

    // Check latency
    const start = Date.now()
    await redis.ping()
    metrics.latency = Date.now() - start

    // Latency should be < 100ms for healthy status
    checks.latency = metrics.latency < 100

    if (!checks.latency) {
      errors.push(`High latency: ${metrics.latency}ms`)
    }

    // Check memory
    try {
      const info = await redis.info('memory')
      const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim()
      const peakMemory = info.match(/used_memory_peak_human:(.+)/)?.[1]?.trim()

      if (usedMemory && peakMemory) {
        metrics.memoryUsed = usedMemory
        metrics.memoryPeak = peakMemory
        checks.memory = true
      }
    } catch (error) {
      errors.push('Failed to retrieve memory info')
    }

    // Get connected clients
    try {
      const clientInfo = await redis.info('clients')
      const clients = clientInfo.match(/connected_clients:(.+)/)?.[1]?.trim()
      if (clients) {
        metrics.connectedClients = parseInt(clients, 10)
      }
    } catch (error) {
      // Non-critical
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  const healthy = checks.connection && checks.latency && checks.memory

  return {
    healthy,
    checks,
    metrics,
    errors,
  }
}

/**
 * Quick Redis ping check
 */
export async function pingRedis(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch {
    return false
  }
}
