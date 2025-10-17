/**
 * Graceful shutdown handler
 */

import { logger } from '@sv-sdk/shared'
import { closeConnections } from '@sv-sdk/db-config'
import { closeRedisConnection } from '@sv-sdk/cache'

/**
 * Shutdown handler callback
 */
export type ShutdownHandler = () => Promise<void> | void

/**
 * Graceful shutdown manager
 */
export class ShutdownManager {
  private handlers: ShutdownHandler[] = []
  private isShuttingDown = false
  private timeout: number

  constructor(options: { timeout?: number } = {}) {
    this.timeout = options.timeout || 30000 // 30 seconds default

    // Register signal handlers
    this.registerSignalHandlers()
  }

  /**
   * Register shutdown handler
   */
  onShutdown(handler: ShutdownHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Execute shutdown
   */
  async shutdown(signal: string = 'SIGTERM'): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress')
      return
    }

    this.isShuttingDown = true

    logger.info(`Received ${signal}, starting graceful shutdown...`)

    // Set timeout for forced shutdown
    const timeoutHandle = setTimeout(() => {
      logger.error(`Shutdown timeout after ${this.timeout}ms, forcing exit`)
      process.exit(1)
    }, this.timeout)

    try {
      // Run custom handlers
      for (const handler of this.handlers) {
        try {
          await handler()
        } catch (error) {
          logger.error('Shutdown handler error', error as Error)
        }
      }

      // Close database connections
      logger.info('Closing database connections...')
      await closeConnections()

      // Close Redis connection
      logger.info('Closing Redis connection...')
      await closeRedisConnection()

      logger.info('Graceful shutdown complete')

      clearTimeout(timeoutHandle)
      process.exit(0)
    } catch (error) {
      logger.error('Shutdown error', error as Error)
      clearTimeout(timeoutHandle)
      process.exit(1)
    }
  }

  /**
   * Register signal handlers for SIGTERM and SIGINT
   */
  private registerSignalHandlers(): void {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'))
    process.on('SIGINT', () => this.shutdown('SIGINT'))

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', error)
      this.shutdown('UNCAUGHT_EXCEPTION')
    })

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection', reason as Error)
      this.shutdown('UNHANDLED_REJECTION')
    })
  }
}

/**
 * Create shutdown manager instance
 */
export function createShutdownManager(options?: { timeout?: number }): ShutdownManager {
  return new ShutdownManager(options)
}

/**
 * Default shutdown manager
 */
export const shutdownManager = createShutdownManager()
