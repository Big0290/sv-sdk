/**
 * Metrics collector
 * Tracks application metrics for monitoring
 */

import { redis } from '@sv-sdk/cache'
import { logger } from '@sv-sdk/shared'

/**
 * Metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary'

/**
 * Metric value
 */
export interface Metric {
  name: string
  type: MetricType
  value: number
  labels?: Record<string, string>
  timestamp: Date
}

/**
 * Metrics store
 */
class MetricsCollector {
  private metrics: Map<string, Metric> = new Map()

  /**
   * Increment counter metric
   */
  async incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): Promise<void> {
    const key = this.getMetricKey(name, labels)

    try {
      // Increment in Redis for persistence
      const redisKey = `metrics:counter:${key}`
      await redis.incrby(redisKey, value)

      // Update local cache
      const existing = this.metrics.get(key)

      if (existing) {
        existing.value += value
        existing.timestamp = new Date()
      } else {
        this.metrics.set(key, {
          name,
          type: 'counter',
          value,
          labels,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      logger.error('Failed to increment counter', error as Error, { name, labels })
    }
  }

  /**
   * Set gauge metric
   */
  async setGauge(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    const key = this.getMetricKey(name, labels)

    try {
      // Store in Redis
      const redisKey = `metrics:gauge:${key}`
      await redis.set(redisKey, value)

      // Update local cache
      this.metrics.set(key, {
        name,
        type: 'gauge',
        value,
        labels,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error('Failed to set gauge', error as Error, { name, labels })
    }
  }

  /**
   * Record histogram value
   */
  async recordHistogram(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    const key = this.getMetricKey(name, labels)

    try {
      // Add to sorted set in Redis for percentile calculations
      const redisKey = `metrics:histogram:${key}`
      const timestamp = Date.now()

      await redis.zadd(redisKey, timestamp, `${timestamp}:${value}`)

      // Keep only recent values (last hour)
      const oneHourAgo = timestamp - 60 * 60 * 1000
      await redis.zremrangebyscore(redisKey, 0, oneHourAgo)
    } catch (error) {
      logger.error('Failed to record histogram', error as Error, { name, labels })
    }
  }

  /**
   * Get metric value
   */
  async getMetric(name: string, labels?: Record<string, string>): Promise<Metric | null> {
    const key = this.getMetricKey(name, labels)

    // Try local cache first
    const cached = this.metrics.get(key)
    if (cached) {
      return cached
    }

    // Try Redis
    try {
      const redisKey = `metrics:counter:${key}`
      const value = await redis.get(redisKey)

      if (value) {
        return {
          name,
          type: 'counter',
          value: parseInt(value),
          labels,
          timestamp: new Date(),
        }
      }
    } catch (error) {
      logger.error('Failed to get metric', error as Error, { name, labels })
    }

    return null
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Generate metric key
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }

    const labelParts = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')

    return `${name}{${labelParts}}`
  }
}

/**
 * Singleton metrics collector
 */
export const metricsCollector = new MetricsCollector()

/**
 * Track request latency
 */
export async function trackRequestLatency(endpoint: string, latencyMs: number): Promise<void> {
  await metricsCollector.recordHistogram('http_request_duration_ms', latencyMs, { endpoint })
}

/**
 * Track error rate
 */
export async function trackError(type: string, endpoint?: string): Promise<void> {
  await metricsCollector.incrementCounter('errors_total', 1, { type, endpoint: endpoint || 'unknown' })
}

/**
 * Track queue depth
 */
export async function trackQueueDepth(queue: string, depth: number): Promise<void> {
  await metricsCollector.setGauge('queue_depth', depth, { queue })
}

/**
 * Track email send
 */
export async function trackEmailSend(provider: string, status: 'success' | 'failed'): Promise<void> {
  await metricsCollector.incrementCounter('emails_sent_total', 1, { provider, status })
}

/**
 * Track database connection pool
 */
export async function trackDatabasePool(active: number, idle: number): Promise<void> {
  await metricsCollector.setGauge('db_pool_active', active)
  await metricsCollector.setGauge('db_pool_idle', idle)
}

/**
 * Track cache hit/miss
 */
export async function trackCacheHit(hit: boolean): Promise<void> {
  await metricsCollector.incrementCounter('cache_requests_total', 1, { result: hit ? 'hit' : 'miss' })
}

