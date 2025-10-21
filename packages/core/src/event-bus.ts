/**
 * Event Bus
 * Type-safe event emission and subscription system
 */

import { logger } from '@sv-sdk/shared'

/**
 * Event listener function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * Event listener with metadata
 */
interface EventListenerEntry {
  listener: EventListener
  priority: number
  once: boolean
}

/**
 * Event Bus Options
 */
export interface EventBusOptions {
  /**
   * Maximum number of listeners per event (prevents memory leaks)
   */
  maxListeners?: number

  /**
   * Log all events (for debugging)
   */
  logEvents?: boolean
}

/**
 * Event Bus Implementation
 */
export class EventBus {
  private listeners = new Map<string, EventListenerEntry[]>()
  private maxListeners: number
  private logEvents: boolean

  constructor(options: EventBusOptions = {}) {
    this.maxListeners = options.maxListeners || 100
    this.logEvents = options.logEvents || false
  }

  /**
   * Subscribe to event
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<T = any>(event: string, listener: EventListener<T>, priority: number = 5): void {
    this.addEventListener(event, listener, priority, false)
  }

  /**
   * Subscribe to event (fires once then unsubscribes)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once<T = any>(event: string, listener: EventListener<T>, priority: number = 5): void {
    this.addEventListener(event, listener, priority, true)
  }

  /**
   * Unsubscribe from event
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(event)

    if (!listeners) {
      return
    }

    const index = listeners.findIndex((entry) => entry.listener === listener)

    if (index !== -1) {
      listeners.splice(index, 1)

      if (listeners.length === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emit<T = any>(event: string, data?: T): Promise<void> {
    const listeners = this.listeners.get(event)

    if (!listeners || listeners.length === 0) {
      if (this.logEvents) {
        logger.debug(`Event emitted with no listeners: ${event}`)
      }
      return
    }

    if (this.logEvents) {
      logger.debug(`Event emitted: ${event}`, { listenerCount: listeners.length })
    }

    // Sort by priority (lower number = higher priority)
    const sortedListeners = [...listeners].sort((a, b) => a.priority - b.priority)

    // Call all listeners
    const promises: Promise<void>[] = []

    for (const entry of sortedListeners) {
      try {
        const result = entry.listener(data as T)

        // Handle async listeners
        if (result instanceof Promise) {
          promises.push(
            result.catch((error) => {
              logger.error(`Event listener error for event: ${event}`, error)
            })
          )
        }

        // Remove once listeners
        if (entry.once) {
          this.off(event, entry.listener)
        }
      } catch (error) {
        // Synchronous listener error
        logger.error(`Event listener error for event: ${event}`, error as Error)
      }
    }

    // Wait for all async listeners
    if (promises.length > 0) {
      await Promise.all(promises)
    }
  }

  /**
   * Emit event synchronously (does not wait for async listeners)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitSync<T = any>(event: string, data?: T): void {
    const listeners = this.listeners.get(event)

    if (!listeners || listeners.length === 0) {
      return
    }

    const sortedListeners = [...listeners].sort((a, b) => a.priority - b.priority)

    for (const entry of sortedListeners) {
      try {
        entry.listener(data as T)

        if (entry.once) {
          this.off(event, entry.listener)
        }
      } catch (error) {
        logger.error(`Event listener error for event: ${event}`, error as Error)
      }
    }
  }

  /**
   * Remove all listeners for event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get listener count for event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Add event listener with metadata
   */
  private addEventListener(event: string, listener: EventListener, priority: number, once: boolean): void {
    let listeners = this.listeners.get(event)

    if (!listeners) {
      listeners = []
      this.listeners.set(event, listeners)
    }

    // Check max listeners
    if (listeners.length >= this.maxListeners) {
      logger.warn(`Max listeners (${this.maxListeners}) reached for event: ${event}`)
    }

    listeners.push({
      listener,
      priority,
      once,
    })
  }
}

/**
 * Create event bus instance
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  return new EventBus(options)
}
