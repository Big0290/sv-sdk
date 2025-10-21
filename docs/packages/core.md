# Core SDK

The foundation of SV-SDK providing plugin system, event bus, and SDK initialization.

## Installation

```bash
pnpm add @sv-sdk/core
```

## Features

- **SDK Initialization** - Create and configure the SDK instance
- **Plugin System** - Extensible plugin architecture with dependency resolution
- **Event Bus** - Type-safe inter-plugin communication
- **SDK Context** - Unified access to all services
- **Health Checks** - Monitor system health
- **Graceful Shutdown** - Proper cleanup on application exit

## Basic Usage

### Initialize SDK

```typescript
import { createSDK } from '@sv-sdk/core'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: 'development',
    baseUrl: 'http://localhost:5173',
    debug: true,
  },
  plugins: [],
})

// Access services
const { db, redis, logger, eventBus } = sdk.context
```

### With Plugins

```typescript
import { createSDK } from '@sv-sdk/core'
import { authPlugin } from '@sv-sdk/auth'
import { emailPlugin } from '@sv-sdk/email'
import { auditPlugin } from '@sv-sdk/audit'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
  },
  plugins: [authPlugin, emailPlugin, auditPlugin],
})

// Plugins are loaded in dependency order automatically
```

## API Reference

### createSDK(options)

Creates and initializes the SDK instance.

**Parameters:**

- `options.config` - SDK configuration
  - `name` (string) - Application name
  - `version` (string) - Application version
  - `env` ('development' | 'production' | 'test') - Environment
  - `baseUrl` (string) - Base URL for the application
  - `debug` (boolean) - Enable debug mode
- `options.plugins` (Plugin[]) - Array of plugins to load

**Returns:** `Promise<SDK>`

```typescript
interface SDK {
  context: SDKContext
  plugins: PluginMetadata[]
  shutdown: () => Promise<void>
  isHealthy: () => Promise<boolean>
}
```

### SDK Context

Access to all core services:

```typescript
interface SDKContext {
  // Core services
  db: DrizzleDB // PostgreSQL via Drizzle ORM
  redis: Redis // Redis client
  logger: Logger // Pino logger
  eventBus: EventBus // Event emitter

  // Configuration
  config: SDKConfig

  // Service registry
  registerService<T>(name: string, service: T): void
  getService<T>(name: string): T | undefined
  hasService(name: string): boolean
}
```

## Creating Plugins

### Basic Plugin

```typescript
import { createPlugin } from '@sv-sdk/core'

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',

  lifecycle: {
    async init(ctx) {
      ctx.logger.info('Plugin initialized')

      // Register a service
      ctx.registerService('myService', {
        doSomething: () => {
          ctx.logger.info('Doing something')
        },
      })
    },
  },
})
```

### Plugin with Dependencies

```typescript
const advancedPlugin = createPlugin({
  name: 'advanced-plugin',
  version: '1.0.0',
  dependencies: ['auth', 'email'], // Loads after these plugins

  lifecycle: {
    async beforeInit(ctx) {
      // Setup before initialization
      ctx.logger.info('Preparing plugin')
    },

    async init(ctx) {
      // Access other plugin services
      const authService = ctx.getService('auth')
      const emailService = ctx.getService('email')

      // Register service
      ctx.registerService('advanced', {
        // Service methods
      })

      // Listen to events
      ctx.eventBus.on('user.created', async (user) => {
        ctx.logger.info('User created', { userId: user.id })
      })
    },

    async afterInit(ctx) {
      // Final setup
      ctx.logger.info('Plugin ready')
    },

    async onDestroy() {
      // Cleanup
      console.log('Shutting down plugin')
    },
  },
})
```

## Health Checks

### Check SDK Health

```typescript
// Check if SDK is healthy
const healthy = await sdk.isHealthy()

if (healthy) {
  console.log('SDK is running properly')
} else {
  console.error('SDK health check failed')
}
```

### Individual Service Health

```typescript
import { checkDatabaseHealth, checkRedisHealth } from '@sv-sdk/core'

// Check database
const dbHealth = await checkDatabaseHealth(sdk.context.db)
console.log('Database:', dbHealth.healthy ? 'OK' : 'FAIL')

// Check Redis
const redisHealth = await checkRedisHealth(sdk.context.redis)
console.log('Redis:', redisHealth.healthy ? 'OK' : 'FAIL')
```

## Graceful Shutdown

Handle cleanup when application stops:

```typescript
// Initialize SDK
const sdk = await createSDK({ ... })

// Shutdown on SIGTERM
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await sdk.shutdown()
  process.exit(0)
})

// Shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await sdk.shutdown()
  process.exit(0)
})
```

## Event Bus

The event bus enables communication between plugins:

```typescript
// Emit events
sdk.context.eventBus.emit('user.created', {
  id: '123',
  email: 'user@example.com',
})

// Listen to events
sdk.context.eventBus.on('user.created', async (user) => {
  console.log('New user:', user.email)
})

// Listen once
sdk.context.eventBus.once('app.ready', () => {
  console.log('App is ready!')
})
```

## Service Registry

Share services between plugins:

```typescript
// Plugin A: Register service
ctx.registerService('analytics', {
  track: (event, properties) => {
    console.log('Tracking:', event, properties)
  },
})

// Plugin B: Use service
const analytics = ctx.getService('analytics')
if (analytics) {
  analytics.track('page.viewed', { page: '/dashboard' })
}
```

## Configuration

### From Object

```typescript
const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: 'production',
    baseUrl: 'https://app.example.com',
  },
})
```

### From Environment

```bash
# .env
NODE_ENV=production
BETTER_AUTH_URL=https://app.example.com
```

```typescript
const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: process.env.NODE_ENV as any,
    baseUrl: process.env.BETTER_AUTH_URL,
  },
})
```

## Examples

### Complete Application

```typescript
import { createSDK } from '@sv-sdk/core'
import { authPlugin } from '@sv-sdk/auth'
import { emailPlugin } from '@sv-sdk/email'

async function main() {
  // Initialize SDK
  const sdk = await createSDK({
    config: {
      name: 'my-app',
      version: '1.0.0',
      env: 'production',
    },
    plugins: [authPlugin, emailPlugin],
  })

  // Use services
  const { logger, eventBus } = sdk.context

  logger.info('Application started')

  // Listen to events
  eventBus.on('user.login', (user) => {
    logger.info('User logged in', { userId: user.id })
  })

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('Shutting down...')
    await sdk.shutdown()
    process.exit(0)
  })
}

main().catch(console.error)
```

### Custom Plugin Example

See [Plugin System Guide →](/core-concepts/plugin-system)

## Best Practices

1. **Initialize Once** - Create SDK instance once at application startup
2. **Use Context** - Access all services through SDK context
3. **Handle Shutdown** - Always implement graceful shutdown
4. **Monitor Health** - Regularly check SDK health in production
5. **Use Plugins** - Organize functionality into plugins
6. **Type Safety** - Use TypeScript for full type checking

## TypeScript Types

```typescript
import type { SDK, SDKContext, SDKConfig, Plugin, PluginMetadata, EventBus } from '@sv-sdk/core'
```

## Related Documentation

- [Plugin System →](/core-concepts/plugin-system)
- [Event Bus →](/core-concepts/event-bus)
- [Architecture →](/core-concepts/architecture)
- [API Reference →](/api/core)
