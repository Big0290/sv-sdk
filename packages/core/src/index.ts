/**
 * Core SDK package
 * Export SDK creation, context, plugins, event bus, and utilities
 */

// SDK creation
export { createSDK, type SDK, type CreateSDKOptions } from './create-sdk.js'

// SDK context
export { createSDKContext, type SDKContext, type SDKConfig } from './sdk-context.js'

// Event bus
export { EventBus, createEventBus, type EventListener, type EventBusOptions } from './event-bus.js'

// Plugin system
export {
  createPlugin,
  validatePlugin,
  type Plugin,
  type PluginConfig,
  type PluginLifecycle,
  type PluginMetadata,
} from './plugin.js'

export { resolvePluginOrder, loadPlugins, unloadPlugins, PluginLoadError } from './plugin-loader.js'

// Health checks
export {
  checkSystemHealth,
  createHealthCheckHandler,
  livenessProbe,
  readinessProbe,
  type SystemHealth,
  type ServiceHealth,
} from './health.js'

// Shutdown
export { ShutdownManager, createShutdownManager, shutdownManager, type ShutdownHandler } from './shutdown.js'
