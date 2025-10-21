# Plugin System

Learn how to create and use plugins to extend SV-SDK functionality.

## Overview

The plugin system is the foundation of SV-SDK's extensibility. It allows you to:

- Add custom functionality to the SDK
- Integrate third-party services
- Share reusable features across projects
- Organize your application logic

## Plugin Structure

A plugin is an object that implements the `Plugin` interface:

```typescript
import { createPlugin, type Plugin } from '@sv-sdk/core'

const myPlugin: Plugin = createPlugin({
  name: 'my-plugin', // Unique plugin name
  version: '1.0.0', // Semantic version
  description: 'My custom plugin', // Optional description
  dependencies: [], // Other plugins this depends on

  lifecycle: {
    async beforeInit(ctx) {
      // Runs before initialization
    },

    async init(ctx) {
      // Main initialization (required)
    },

    async afterInit(ctx) {
      // Runs after initialization
    },

    async onDestroy() {
      // Cleanup on shutdown
    },
  },
})
```

## Lifecycle Hooks

Plugins have four lifecycle hooks:

### 1. `beforeInit(ctx)`

Runs **before** the plugin is initialized. Use for:

- Setting up prerequisites
- Validating configuration
- Preparing resources

```typescript
async beforeInit(ctx) {
  ctx.logger.info('Setting up plugin...')

  // Validate required env vars
  if (!process.env.MY_API_KEY) {
    throw new Error('MY_API_KEY is required')
  }

  // Check dependencies
  const hasRedis = await ctx.redis.ping()
  if (!hasRedis) {
    throw new Error('Redis is required')
  }
}
```

### 2. `init(ctx)` (Required)

Main initialization logic. Use for:

- Registering services
- Setting up event listeners
- Initializing connections
- Registering routes/middleware

```typescript
async init(ctx) {
  ctx.logger.info('Initializing plugin')

  // Register service
  ctx.registerService('myService', {
    doSomething: () => {
      ctx.logger.info('Doing something')
    },
    getData: async () => {
      return await ctx.db.query.myTable.findMany()
    }
  })

  // Listen to events
  ctx.eventBus.on('user.created', async (user) => {
    ctx.logger.info('User created', { userId: user.id })
    // Handle event
  })

  // Schedule background tasks
  setInterval(() => {
    ctx.logger.debug('Running background task')
  }, 60000)
}
```

### 3. `afterInit(ctx)`

Runs **after** the plugin is initialized. Use for:

- Final setup steps
- Verifying everything is working
- Emitting "ready" events

```typescript
async afterInit(ctx) {
  ctx.logger.info('Plugin ready')

  // Verify service is working
  const service = ctx.getService('myService')
  if (service) {
    ctx.logger.info('Service registered successfully')
  }

  // Emit ready event
  ctx.eventBus.emit('plugin.ready', { name: 'my-plugin' })
}
```

### 4. `onDestroy()`

Cleanup when SDK shuts down. Use for:

- Closing connections
- Saving state
- Canceling timers
- Releasing resources

```typescript
async onDestroy() {
  console.log('Cleaning up plugin')

  // Close connections
  await this.connection.close()

  // Clear timers
  clearInterval(this.intervalId)

  // Save state
  await this.saveState()
}
```

## SDK Context

The SDK context provides access to core services:

```typescript
interface SDKContext {
  // Core services
  db: DrizzleDB // Database client
  redis: Redis // Redis client
  logger: Logger // Pino logger
  eventBus: EventBus // Event emitter

  // Configuration
  config: SDKConfig // SDK configuration

  // Service registry
  registerService(name: string, service: any): void
  getService<T>(name: string): T | undefined
  hasService(name: string): boolean
}
```

### Using the Database

```typescript
import { users } from '@sv-sdk/db-config'

async init(ctx) {
  // Query users
  const allUsers = await ctx.db.query.users.findMany()

  // Insert user
  await ctx.db.insert(users).values({
    email: 'user@example.com',
    name: 'John Doe'
  })

  // Update user
  await ctx.db.update(users)
    .set({ name: 'Jane Doe' })
    .where(eq(users.id, '123'))
}
```

### Using Redis

```typescript
async init(ctx) {
  // Set value
  await ctx.redis.set('key', 'value', 'EX', 3600)

  // Get value
  const value = await ctx.redis.get('key')

  // Delete value
  await ctx.redis.del('key')

  // Use caching utilities
  import { cacheSet, cacheGet } from '@sv-sdk/cache'

  await cacheSet('user:123', userData, 300)
  const cached = await cacheGet('user:123')
}
```

### Using the Logger

```typescript
async init(ctx) {
  ctx.logger.debug('Debug message', { extra: 'data' })
  ctx.logger.info('Info message')
  ctx.logger.warn('Warning message')
  ctx.logger.error('Error message', error)

  // Create child logger
  const childLogger = ctx.logger.child({ plugin: 'my-plugin' })
  childLogger.info('Message from my plugin')
}
```

### Using the Event Bus

```typescript
async init(ctx) {
  // Listen to events
  ctx.eventBus.on('user.created', async (user) => {
    console.log('User created:', user.id)
  })

  // Emit events
  ctx.eventBus.emit('custom.event', { data: 'value' })

  // Once listener (auto-removed after first trigger)
  ctx.eventBus.once('app.ready', () => {
    console.log('App is ready')
  })

  // Remove listener
  const listener = (user) => console.log(user)
  ctx.eventBus.on('user.updated', listener)
  ctx.eventBus.off('user.updated', listener)
}
```

## Service Registry

Register services that other plugins can use:

```typescript
// In your plugin
async init(ctx) {
  ctx.registerService('analytics', {
    track: (event, properties) => {
      // Track analytics event
    },
    identify: (userId, traits) => {
      // Identify user
    }
  })
}

// In another plugin
async init(ctx) {
  const analytics = ctx.getService('analytics')
  if (analytics) {
    analytics.track('page.viewed', { page: '/dashboard' })
  }
}
```

## Plugin Dependencies

Specify dependencies to ensure plugins load in correct order:

```typescript
const emailPlugin = createPlugin({
  name: 'email',
  dependencies: ['auth'], // Requires auth plugin

  async init(ctx) {
    // Can safely use auth service
    const authService = ctx.getService('auth')
  },
})

const sdk = await createSDK({
  plugins: [authPlugin, emailPlugin], // Order doesn't matter
})
// SDK will automatically load auth plugin first
```

## Complete Plugin Example

Here's a complete analytics plugin:

```typescript
import { createPlugin } from '@sv-sdk/core'
import type { Plugin } from '@sv-sdk/core'

interface AnalyticsEvent {
  event: string
  userId?: string
  properties?: Record<string, any>
  timestamp: Date
}

const analyticsPlugin: Plugin = createPlugin({
  name: 'analytics',
  version: '1.0.0',
  description: 'Analytics tracking plugin',
  dependencies: ['auth'],

  lifecycle: {
    async beforeInit(ctx) {
      // Validate configuration
      const apiKey = ctx.config.analytics?.apiKey
      if (!apiKey) {
        throw new Error('Analytics API key is required')
      }

      ctx.logger.info('Analytics plugin setup')
    },

    async init(ctx) {
      ctx.logger.info('Initializing analytics')

      // Track events from event bus
      ctx.eventBus.on('user.login', async (user) => {
        await trackEvent({
          event: 'user.login',
          userId: user.id,
          timestamp: new Date(),
        })
      })

      ctx.eventBus.on('user.signup', async (user) => {
        await trackEvent({
          event: 'user.signup',
          userId: user.id,
          properties: {
            signupMethod: user.signupMethod,
          },
          timestamp: new Date(),
        })
      })

      // Register service
      ctx.registerService('analytics', {
        track: async (event: string, properties?: Record<string, any>) => {
          const authService = ctx.getService('auth')
          const currentUser = authService?.getCurrentUser()

          await trackEvent({
            event,
            userId: currentUser?.id,
            properties,
            timestamp: new Date(),
          })
        },

        identify: async (userId: string, traits: Record<string, any>) => {
          ctx.logger.info('Identifying user', { userId })
          // Send to analytics service
        },
      })

      // Helper function
      async function trackEvent(event: AnalyticsEvent) {
        ctx.logger.debug('Tracking event', event)

        // Store in database
        await ctx.db.insert(analyticsEvents).values({
          event: event.event,
          userId: event.userId,
          properties: event.properties,
          timestamp: event.timestamp,
        })

        // Send to external service
        // await sendToAnalyticsService(event)
      }
    },

    async afterInit(ctx) {
      ctx.logger.info('Analytics plugin ready')
      ctx.eventBus.emit('plugin.analytics.ready')
    },

    async onDestroy() {
      console.log('Shutting down analytics plugin')
      // Flush any pending events
    },
  },
})

export default analyticsPlugin
```

## Using Plugins

### Load Plugins

```typescript
import { createSDK } from '@sv-sdk/core'
import analyticsPlugin from './plugins/analytics'
import customPlugin from './plugins/custom'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
  },
  plugins: [analyticsPlugin, customPlugin],
})
```

### Access Services

```typescript
// After SDK initialization
const analytics = sdk.context.getService('analytics')
if (analytics) {
  analytics.track('page.viewed', { page: '/dashboard' })
}
```

## Built-in Plugins

SV-SDK includes several built-in plugins you can use:

```typescript
import { authPlugin } from '@sv-sdk/auth'
import { emailPlugin } from '@sv-sdk/email'
import { auditPlugin } from '@sv-sdk/audit'
import { permissionsPlugin } from '@sv-sdk/permissions'

const sdk = await createSDK({
  plugins: [authPlugin, emailPlugin, auditPlugin, permissionsPlugin],
})
```

## Best Practices

### 1. Single Responsibility

Each plugin should do one thing well:

```typescript
// ✅ Good - focused plugin
const emailPlugin = createPlugin({
  name: 'email',
  async init(ctx) {
    // Only email-related functionality
  },
})

// ❌ Bad - too many responsibilities
const everythingPlugin = createPlugin({
  name: 'everything',
  async init(ctx) {
    // Email, analytics, notifications, etc.
  },
})
```

### 2. Error Handling

Handle errors gracefully:

```typescript
async init(ctx) {
  try {
    await this.setupService()
  } catch (error) {
    ctx.logger.error('Failed to setup service', error)
    // Don't throw - allow SDK to continue
    // Or throw if plugin is critical
  }
}
```

### 3. Configuration

Use configuration for flexibility:

```typescript
async init(ctx) {
  const config = ctx.config.myPlugin || {}
  const apiKey = config.apiKey || process.env.MY_API_KEY
  const timeout = config.timeout || 5000

  // Use configuration
}
```

### 4. Testing

Make plugins testable:

```typescript
// plugin.ts
export function createAnalyticsPlugin(config) {
  return createPlugin({
    name: 'analytics',
    async init(ctx) {
      // Use config
    },
  })
}

// plugin.test.ts
import { createAnalyticsPlugin } from './plugin'

test('plugin initializes correctly', async () => {
  const plugin = createAnalyticsPlugin({ apiKey: 'test' })
  // Test plugin
})
```

### 5. Documentation

Document your plugins:

```typescript
/**
 * Analytics Plugin
 *
 * Tracks user events and sends them to an analytics service.
 *
 * @example
 * const sdk = await createSDK({
 *   plugins: [analyticsPlugin]
 * })
 *
 * const analytics = sdk.context.getService('analytics')
 * analytics.track('event', { prop: 'value' })
 */
const analyticsPlugin = createPlugin({
  // ...
})
```

## Next Steps

- [Event Bus →](/core-concepts/event-bus)
- [Architecture →](/core-concepts/architecture)
- [Custom Plugin Examples →](/examples/custom-plugins)
