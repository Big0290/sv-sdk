/**
 * SDK initialization
 * Creates and configures the SDK instance
 */

import { db } from '@sv-sdk/db-config'
import { redis } from '@sv-sdk/cache'
import { createLogger, LogLevel } from '@sv-sdk/shared'
import { createEventBus } from './event-bus.js'
import { createSDKContext, type SDKConfig } from './sdk-context.js'
import { loadPlugins, unloadPlugins } from './plugin-loader.js'
import type { Plugin, PluginMetadata } from './plugin.js'
import type { SDKContext } from './sdk-context.js'

/**
 * SDK Instance
 */
export interface SDK {
  /**
   * SDK Context (access to all services)
   */
  context: SDKContext

  /**
   * Loaded plugins
   */
  plugins: PluginMetadata[]

  /**
   * Shutdown SDK gracefully
   */
  shutdown: () => Promise<void>

  /**
   * Check if SDK is healthy
   */
  isHealthy: () => Promise<boolean>
}

/**
 * Create SDK Options
 */
export interface CreateSDKOptions {
  /**
   * Plugins to load
   */
  plugins?: Plugin[]

  /**
   * SDK configuration
   */
  config: Partial<SDKConfig>

  /**
   * Enable debug mode
   */
  debug?: boolean
}

/**
 * Create and initialize SDK
 */
export async function createSDK(options: CreateSDKOptions): Promise<SDK> {
  const { plugins = [], config: userConfig, debug = false } = options

  // Merge default config with user config
  const nodeEnv = process.env.NODE_ENV
  const env: 'development' | 'production' | 'test' =
    nodeEnv === 'production' || nodeEnv === 'test' ? nodeEnv : 'development'

  const config: SDKConfig = {
    name: 'sv-sdk',
    version: '0.0.1',
    env,
    baseUrl: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
    debug: debug || process.env.DEBUG === 'true',
    ...userConfig,
  }

  // Create logger
  const sdkLogger = createLogger({
    level: config.debug ? LogLevel.DEBUG : LogLevel.INFO,
    pretty: config.env === 'development',
  })

  sdkLogger.info('Initializing SV-SDK...', { version: config.version, env: config.env })

  // Create event bus
  const eventBus = createEventBus({
    maxListeners: 100,
    logEvents: config.debug,
  })

  // Create SDK context
  const context = createSDKContext({
    db,
    redis,
    logger: sdkLogger,
    eventBus,
    config,
  })

  // Load plugins
  let pluginMetadata: PluginMetadata[] = []

  try {
    pluginMetadata = await loadPlugins(plugins, context)
    sdkLogger.info('SDK initialized successfully')
  } catch (error) {
    sdkLogger.error('SDK initialization failed', error as Error)
    throw error
  }

  // Create SDK instance
  const sdk: SDK = {
    context,
    plugins: pluginMetadata,

    async shutdown() {
      sdkLogger.info('Shutting down SDK...')

      try {
        // Emit shutdown event
        await eventBus.emit('sdk:shutdown')

        // Unload plugins
        await unloadPlugins(plugins)

        // Close connections
        await redis.quit()

        // Note: Database connection closed by db-config package

        sdkLogger.info('SDK shutdown complete')
      } catch (error) {
        sdkLogger.error('Error during shutdown', error as Error)
        throw error
      }
    },

    async isHealthy() {
      try {
        // Check database
        const dbHealth = await db.$client.unsafe('SELECT 1')
        if (!dbHealth) return false

        // Check Redis
        const redisHealth = await redis.ping()
        if (redisHealth !== 'PONG') return false

        return true
      } catch (error) {
        sdkLogger.error('Health check failed', error as Error)
        return false
      }
    },
  }

  return sdk
}
