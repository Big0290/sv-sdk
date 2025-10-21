/**
 * SDK Context
 * Shared context passed to all plugins and components
 */

import type { Database } from '@sv-sdk/db-config'
import type { Logger } from '@sv-sdk/shared'
import type { EventBus } from './event-bus.js'
import type { Redis } from '@sv-sdk/cache'

/**
 * SDK Configuration
 */
export interface SDKConfig {
  /**
   * Application name
   */
  name: string

  /**
   * Application version
   */
  version: string

  /**
   * Environment (development, production, test)
   */
  env: 'development' | 'production' | 'test'

  /**
   * Base URL for the application
   */
  baseUrl: string

  /**
   * Enable debug mode
   */
  debug?: boolean

  /**
   * Custom configuration
   */
  [key: string]: unknown
}

/**
 * SDK Context Interface
 * Provides access to all core services
 */
export interface SDKContext {
  /**
   * Database client (Drizzle)
   */
  db: Database

  /**
   * Redis client
   */
  redis: Redis

  /**
   * Logger instance
   */
  logger: Logger

  /**
   * Event bus for inter-plugin communication
   */
  eventBus: EventBus

  /**
   * SDK configuration
   */
  config: SDKConfig

  /**
   * Get service by name
   * Allows plugins to access other plugin services
   */
  getService<T>(name: string): T | undefined

  /**
   * Register service
   * Allows plugins to register services for other plugins
   */
  registerService<T>(name: string, service: T): void
}

/**
 * Service registry for plugin services
 */
class ServiceRegistry {
  private services = new Map<string, unknown>()

  register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`)
    }
    this.services.set(name, service)
  }

  get<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined
  }

  has(name: string): boolean {
    return this.services.has(name)
  }

  clear(): void {
    this.services.clear()
  }
}

/**
 * Create SDK Context
 */
export function createSDKContext(options: {
  db: Database
  redis: Redis
  logger: Logger
  eventBus: EventBus
  config: SDKConfig
}): SDKContext {
  const serviceRegistry = new ServiceRegistry()

  return {
    db: options.db,
    redis: options.redis,
    logger: options.logger,
    eventBus: options.eventBus,
    config: options.config,
    getService: <T>(name: string) => serviceRegistry.get<T>(name),
    registerService: <T>(name: string, service: T) => serviceRegistry.register(name, service),
  }
}
