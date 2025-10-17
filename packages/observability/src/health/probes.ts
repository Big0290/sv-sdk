/**
 * Health check probes
 * Kubernetes-style liveness and readiness probes
 */

import { checkSystemHealth } from '@sv-sdk/core'
import { logger } from '@sv-sdk/shared'

/**
 * Liveness probe
 * Indicates if the application is running
 * Should return quickly and not depend on external services
 */
export function livenessProbe(): {
  alive: boolean
  timestamp: string
} {
  return {
    alive: true,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Readiness probe
 * Indicates if the application is ready to handle traffic
 * Checks dependencies (database, Redis, etc.)
 */
export async function readinessProbe(): Promise<{
  ready: boolean
  services: {
    name: string
    ready: boolean
  }[]
  timestamp: string
}> {
  try {
    const health = await checkSystemHealth()

    const services = Object.entries(health.services).map(([name, status]) => ({
      name,
      ready: status.healthy,
    }))

    return {
      ready: health.healthy,
      services,
      timestamp: health.timestamp,
    }
  } catch (error) {
    logger.error('Readiness probe failed', error as Error)

    return {
      ready: false,
      services: [],
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Startup probe
 * Indicates if the application has finished starting up
 * Useful for slow-starting applications
 */
export async function startupProbe(): Promise<{
  started: boolean
  timestamp: string
}> {
  // Check if critical services are initialized
  const readiness = await readinessProbe()

  return {
    started: readiness.ready,
    timestamp: readiness.timestamp,
  }
}

/**
 * Create HTTP handler for probes
 */
export function createProbeHandlers() {
  return {
    /**
     * GET /health/live
     */
    liveness: () => {
      const result = livenessProbe()
      return {
        status: 200,
        body: result,
      }
    },

    /**
     * GET /health/ready
     */
    readiness: async () => {
      const result = await readinessProbe()
      return {
        status: result.ready ? 200 : 503,
        body: result,
      }
    },

    /**
     * GET /health/startup
     */
    startup: async () => {
      const result = await startupProbe()
      return {
        status: result.started ? 200 : 503,
        body: result,
      }
    },
  }
}

