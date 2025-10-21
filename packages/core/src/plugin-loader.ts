/**
 * Plugin loader with dependency resolution
 */

import { logger } from '@big0290/shared'
import type { Plugin, PluginMetadata } from './plugin.js'
import { validatePlugin } from './plugin.js'
import type { SDKContext } from './sdk-context.js'

/**
 * Plugin loading error
 */
export class PluginLoadError extends Error {
  constructor(
    public pluginName: string,
    message: string,
    public cause?: Error
  ) {
    super(`Plugin ${pluginName}: ${message}`)
    this.name = 'PluginLoadError'
  }
}

/**
 * Resolve plugin dependencies and return initialization order
 * Uses topological sort to handle dependencies
 */
export function resolvePluginOrder(plugins: Plugin[]): Plugin[] {
  const pluginMap = new Map<string, Plugin>()
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const order: Plugin[] = []

  // Build plugin map
  for (const plugin of plugins) {
    pluginMap.set(plugin.name, plugin)
  }

  // Depth-first search for topological sort
  function visit(pluginName: string): void {
    if (visited.has(pluginName)) {
      return
    }

    if (visiting.has(pluginName)) {
      throw new Error(`Circular dependency detected: ${pluginName}`)
    }

    const plugin = pluginMap.get(pluginName)

    if (!plugin) {
      throw new Error(`Plugin dependency not found: ${pluginName}`)
    }

    visiting.add(pluginName)

    // Visit dependencies first
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        visit(dep)
      }
    }

    visiting.delete(pluginName)
    visited.add(pluginName)
    order.push(plugin)
  }

  // Visit all plugins
  for (const plugin of plugins) {
    visit(plugin.name)
  }

  return order
}

/**
 * Load plugins with dependency resolution
 */
export async function loadPlugins(plugins: Plugin[], ctx: SDKContext): Promise<PluginMetadata[]> {
  const metadata: PluginMetadata[] = []

  try {
    // Validate all plugins first
    for (const plugin of plugins) {
      validatePlugin(plugin)
    }

    // Resolve initialization order
    const orderedPlugins = resolvePluginOrder(plugins)

    logger.info(`Loading ${orderedPlugins.length} plugins in order: ${orderedPlugins.map((p) => p.name).join(', ')}`)

    // Initialize plugins in order
    for (const plugin of orderedPlugins) {
      const pluginMeta: PluginMetadata = {
        name: plugin.name,
        version: plugin.version,
        initialized: false,
      }

      try {
        logger.info(`Initializing plugin: ${plugin.name}@${plugin.version}`)

        // beforeInit hook
        if (plugin.lifecycle.beforeInit) {
          logger.debug(`Running beforeInit for ${plugin.name}`)
          await plugin.lifecycle.beforeInit(ctx)
        }

        // init hook (required)
        logger.debug(`Running init for ${plugin.name}`)
        await plugin.lifecycle.init(ctx)

        // afterInit hook
        if (plugin.lifecycle.afterInit) {
          logger.debug(`Running afterInit for ${plugin.name}`)
          await plugin.lifecycle.afterInit(ctx)
        }

        pluginMeta.initialized = true
        logger.info(`✓ Plugin initialized: ${plugin.name}`)
      } catch (error) {
        pluginMeta.error = error instanceof Error ? error : new Error(String(error))
        logger.error(`✗ Plugin initialization failed: ${plugin.name}`, pluginMeta.error)

        throw new PluginLoadError(plugin.name, 'Initialization failed', pluginMeta.error)
      }

      metadata.push(pluginMeta)
    }

    logger.info(`All ${orderedPlugins.length} plugins loaded successfully`)
  } catch (error) {
    logger.error('Plugin loading failed', error as Error)
    throw error
  }

  return metadata
}

/**
 * Unload plugins in reverse order
 */
export async function unloadPlugins(plugins: Plugin[]): Promise<void> {
  // Reverse order for cleanup
  const reversedPlugins = [...plugins].reverse()

  for (const plugin of reversedPlugins) {
    if (plugin.lifecycle.onDestroy) {
      try {
        logger.info(`Destroying plugin: ${plugin.name}`)
        await plugin.lifecycle.onDestroy()
        logger.info(`✓ Plugin destroyed: ${plugin.name}`)
      } catch (error) {
        logger.error(`✗ Plugin destruction failed: ${plugin.name}`, error as Error)
      }
    }
  }
}
