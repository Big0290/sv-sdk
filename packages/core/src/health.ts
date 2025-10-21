/**
 * System health checks
 * Aggregates health status from all services
 */

import { checkConnection, checkSchemas } from '@sv-sdk/db-config'
import { checkRedisHealth } from '@sv-sdk/cache'
import { logger } from '@sv-sdk/shared'

/**
 * Service health status
 */
export interface ServiceHealth {
  healthy: boolean
  latency?: number
  error?: string
  details?: Record<string, unknown>
}

/**
 * Overall system health
 */
export interface SystemHealth {
  healthy: boolean
  timestamp: string
  services: {
    database: ServiceHealth
    redis: ServiceHealth
    [key: string]: ServiceHealth
  }
}

/**
 * Check overall system health
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const timestamp = new Date().toISOString()
  const services: SystemHealth['services'] = {
    database: { healthy: false },
    redis: { healthy: false },
  }

  // Check database
  try {
    const dbHealth = await checkConnection()
    services.database = {
      healthy: dbHealth.healthy,
      latency: dbHealth.latency,
      error: dbHealth.error,
    }

    // Also check schemas
    if (dbHealth.healthy) {
      const schemasHealth = await checkSchemas()
      services.database.details = {
        schemas: schemasHealth.schemas,
        missing: schemasHealth.missing,
      }

      if (!schemasHealth.exists) {
        services.database.healthy = false
        services.database.error = `Missing schemas: ${schemasHealth.missing.join(', ')}`
      }
    }
  } catch (error) {
    services.database.error = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Database health check failed', error as Error)
  }

  // Check Redis
  try {
    const redisHealth = await checkRedisHealth()
    services.redis = {
      healthy: redisHealth.healthy,
      latency: redisHealth.latency,
      error: redisHealth.error,
      details: {
        status: redisHealth.status,
        memory: redisHealth.memory,
        connectedClients: redisHealth.connectedClients,
      },
    }
  } catch (error) {
    services.redis.error = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Redis health check failed', error as Error)
  }

  // Overall system is healthy if all services are healthy
  const healthy = Object.values(services).every((service) => service.healthy)

  return {
    healthy,
    timestamp,
    services,
  }
}

/**
 * Create health check endpoint handler
 * Returns function compatible with SvelteKit/Express routes
 */
export function createHealthCheckHandler() {
  return async () => {
    const health = await checkSystemHealth()

    return {
      status: health.healthy ? 200 : 503,
      body: health,
    }
  }
}

/**
 * Liveness probe
 * Simple check that application is running
 */
export function livenessProbe(): { alive: boolean } {
  return { alive: true }
}

/**
 * Readiness probe
 * Check if application is ready to handle traffic
 */
export async function readinessProbe(): Promise<{ ready: boolean; services: string[] }> {
  const health = await checkSystemHealth()

  const healthyServices = Object.entries(health.services)
    .filter(([, service]) => service.healthy)
    .map(([name]) => name)

  return {
    ready: health.healthy,
    services: healthyServices,
  }
}
