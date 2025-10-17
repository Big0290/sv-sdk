/**
 * Plugin system types and interfaces
 */

import type { SDKContext } from './sdk-context.js'

/**
 * Plugin configuration
 */
export interface PluginConfig {
  [key: string]: unknown
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  /**
   * Called before plugin initialization
   * Use for setup tasks that must run before init
   */
  beforeInit?: (ctx: SDKContext) => Promise<void> | void

  /**
   * Main initialization hook
   * Required - plugin must implement this
   */
  init: (ctx: SDKContext) => Promise<void> | void

  /**
   * Called after plugin initialization
   * Use for tasks that depend on other plugins being initialized
   */
  afterInit?: (ctx: SDKContext) => Promise<void> | void

  /**
   * Called when plugin is being destroyed
   * Use for cleanup (close connections, clear timers, etc.)
   */
  onDestroy?: () => Promise<void> | void
}

/**
 * Plugin interface
 */
export interface Plugin {
  /**
   * Unique plugin name
   */
  name: string

  /**
   * Plugin version (semver)
   */
  version: string

  /**
   * Plugin description
   */
  description?: string

  /**
   * Other plugins this plugin depends on
   * Will be initialized before this plugin
   */
  dependencies?: string[]

  /**
   * Plugin configuration
   */
  config?: PluginConfig

  /**
   * Plugin lifecycle hooks
   */
  lifecycle: PluginLifecycle
}

/**
 * Plugin metadata for tracking
 */
export interface PluginMetadata {
  name: string
  version: string
  initialized: boolean
  error?: Error
}

/**
 * Create plugin helper
 */
export function createPlugin(plugin: Plugin): Plugin {
  return plugin
}

/**
 * Validate plugin structure
 */
export function validatePlugin(plugin: Plugin): void {
  if (!plugin.name || typeof plugin.name !== 'string') {
    throw new Error('Plugin must have a name')
  }

  if (!plugin.version || typeof plugin.version !== 'string') {
    throw new Error(`Plugin ${plugin.name} must have a version`)
  }

  if (!plugin.lifecycle || typeof plugin.lifecycle.init !== 'function') {
    throw new Error(`Plugin ${plugin.name} must implement init lifecycle hook`)
  }

  // Validate semver format (basic check)
  const semverRegex = /^\d+\.\d+\.\d+/
  if (!semverRegex.test(plugin.version)) {
    throw new Error(`Plugin ${plugin.name} version must follow semver format (e.g., 1.0.0)`)
  }

  // Validate dependencies are array of strings
  if (plugin.dependencies) {
    if (!Array.isArray(plugin.dependencies)) {
      throw new Error(`Plugin ${plugin.name} dependencies must be an array`)
    }

    for (const dep of plugin.dependencies) {
      if (typeof dep !== 'string') {
        throw new Error(`Plugin ${plugin.name} dependencies must be strings`)
      }
    }
  }
}
