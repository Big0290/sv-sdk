# @big0290/core

Core SDK and plugin system for the SV-SDK platform.

## Features

- **SDK Initialization** with plugin support
- **Plugin System** with dependency resolution
- **Event Bus** for type-safe inter-plugin communication
- **SDK Context** providing access to all services
- **Health Checks** for monitoring system status
- **Graceful Shutdown** handling

## Installation

```bash
pnpm add @big0290/core
```

## Usage

### Create SDK Instance

```typescript
import { createSDK } from '@big0290/core'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: 'development',
    baseUrl: 'http://localhost:5173',
  },
  plugins: [
    // Add plugins here
  ],
  debug: true,
})

// Access services via context
const { db, redis, logger, eventBus } = sdk.context

// Shutdown gracefully
await sdk.shutdown()
```

### Create Plugin

```typescript
import { createPlugin, type Plugin } from '@big0290/core'

const myPlugin: Plugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  dependencies: [], // Other plugins this depends on

  lifecycle: {
    async beforeInit(ctx) {
      // Run before initialization
      ctx.logger.info('Setting up my plugin...')
    },

    async init(ctx) {
      // Main initialization (required)
      ctx.logger.info('Initializing my plugin')

      // Register service
      ctx.registerService('myService', {
        doSomething: () => {
          ctx.logger.info('Doing something')
        },
      })

      // Listen to events
      ctx.eventBus.on('user.created', async (user) => {
        ctx.logger.info('User created', { userId: user.id })
      })
    },

    async afterInit(ctx) {
      // Run after initialization
      ctx.logger.info('My plugin ready')
    },

    async onDestroy() {
      // Cleanup on shutdown
      console.log('Cleaning up my plugin')
    },
  },
})
```

### Use Event Bus

```typescript
import { createEventBus } from '@big0290/core'

const eventBus = createEventBus()

// Subscribe to event
eventBus.on('user.created', async (user) => {
  console.log('User created:', user)
})

// Subscribe with priority (lower = higher priority)
eventBus.on('user.created', handler1, 1) // Runs first
eventBus.on('user.created', handler2, 5) // Runs second
eventBus.on('user.created', handler3, 9) // Runs third

// Subscribe once
eventBus.once('app.started', () => {
  console.log('App started (fires only once)')
})

// Emit event
await eventBus.emit('user.created', { id: '123', email: 'user@example.com' })

// Emit synchronously (doesn't wait for async listeners)
eventBus.emitSync('user.login', { userId: '123' })

// Unsubscribe
eventBus.off('user.created', handler)

// Remove all listeners for event
eventBus.removeAllListeners('user.created')

// Get listener count
const count = eventBus.listenerCount('user.created')
```

### Access SDK Context

```typescript
// Inside plugin
lifecycle: {
  async init(ctx) {
    // Database access
    const users = await ctx.db.select().from(users)

    // Redis access
    await ctx.redis.set('key', 'value')

    // Logger
    ctx.logger.info('Plugin initialized')

    // Event bus
    ctx.eventBus.emit('plugin.ready', { name: 'my-plugin' })

    // Configuration
    const baseUrl = ctx.config.baseUrl

    // Register service
    ctx.registerService('myService', myServiceInstance)

    // Get other service
    const otherService = ctx.getService<OtherService>('otherService')
  }
}
```

### Plugin Dependencies

Plugins with dependencies are initialized in correct order:

```typescript
const pluginA = createPlugin({
  name: 'plugin-a',
  version: '1.0.0',
  dependencies: [], // No dependencies
  lifecycle: { init: async (ctx) => {} },
})

const pluginB = createPlugin({
  name: 'plugin-b',
  version: '1.0.0',
  dependencies: ['plugin-a'], // Depends on plugin-a
  lifecycle: { init: async (ctx) => {} },
})

const pluginC = createPlugin({
  name: 'plugin-c',
  version: '1.0.0',
  dependencies: ['plugin-a', 'plugin-b'], // Depends on both
  lifecycle: { init: async (ctx) => {} },
})

const sdk = await createSDK({
  config: { name: 'app', version: '1.0.0' },
  plugins: [pluginC, pluginB, pluginA], // Order doesn't matter
})

// Initialization order: plugin-a → plugin-b → plugin-c
```

### Health Checks

```typescript
import { checkSystemHealth, livenessProbe, readinessProbe } from '@big0290/core'

// Comprehensive health check
const health = await checkSystemHealth()
// {
//   healthy: true,
//   timestamp: '2024-01-15T10:30:00.000Z',
//   services: {
//     database: { healthy: true, latency: 15 },
//     redis: { healthy: true, latency: 5 }
//   }
// }

// Liveness probe (is app running?)
const liveness = livenessProbe()
// { alive: true }

// Readiness probe (can app handle traffic?)
const readiness = await readinessProbe()
// { ready: true, services: ['database', 'redis'] }
```

### Graceful Shutdown

```typescript
import { shutdownManager } from '@big0290/core'

// Register custom shutdown handler
shutdownManager.onShutdown(async () => {
  console.log('Closing my connections...')
  await myService.close()
})

// Shutdown is triggered automatically on SIGTERM/SIGINT
// Or manually:
await shutdownManager.shutdown()
```

## Plugin System

### Plugin Lifecycle

1. **Validation**: Validate plugin structure
2. **Dependency Resolution**: Sort plugins by dependencies
3. **beforeInit**: Pre-initialization hook
4. **init**: Main initialization (required)
5. **afterInit**: Post-initialization hook
6. **onDestroy**: Cleanup on shutdown (reverse order)

### Error Handling

Plugin errors are isolated - one plugin failure doesn't affect others:

```typescript
const plugin = createPlugin({
  name: 'failing-plugin',
  version: '1.0.0',
  lifecycle: {
    async init(ctx) {
      throw new Error('Initialization failed')
    },
  },
})

try {
  await createSDK({
    config: { name: 'app', version: '1.0.0' },
    plugins: [plugin],
  })
} catch (error) {
  // PluginLoadError with details about which plugin failed
  console.error(error)
}
```

## Event System

### Built-in Events

- `sdk:shutdown` - Emitted when SDK is shutting down
- Custom events can be defined by plugins

### Event Priority

Lower priority number = executed first:

- Priority 1: Critical events
- Priority 5: Normal events (default)
- Priority 9: Background events

## Best Practices

1. **Use plugins** for modular architecture
2. **Declare dependencies** explicitly in plugin
3. **Handle errors** in plugin lifecycle hooks
4. **Register cleanup** in onDestroy hook
5. **Use event bus** for loose coupling between plugins
6. **Access services** via SDK context, not direct imports

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Integration

Required by all SDK packages:

- `@big0290/auth` - Implements as plugin
- `@big0290/audit` - Implements as plugin
- `@big0290/email` - Implements as plugin
- `@big0290/permissions` - Implements as plugin

## Example: Complete SDK Setup

```typescript
import { createSDK } from '@big0290/core'
import { authPlugin } from '@big0290/auth'
import { emailPlugin } from '@big0290/email'
import { auditPlugin } from '@big0290/audit'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: 'production',
    baseUrl: 'https://myapp.com',
  },
  plugins: [
    auditPlugin, // No dependencies
    authPlugin, // Depends on audit
    emailPlugin, // Depends on auth and audit
  ],
})

// SDK is ready to use
const healthy = await sdk.isHealthy()

// Shutdown on process exit
process.on('SIGTERM', async () => {
  await sdk.shutdown()
})
```

## License

MIT
