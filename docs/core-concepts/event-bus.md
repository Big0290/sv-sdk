# Event Bus

The Event Bus enables type-safe, async communication between plugins and application components.

## Overview

The Event Bus is a central message broker that allows plugins to:

- **Emit events** when something interesting happens
- **Listen to events** from other plugins
- **Decouple components** by avoiding direct dependencies
- **Enable extensibility** by allowing plugins to react to events

## Basic Usage

### Emitting Events

```typescript
import type { SDKContext } from '@big0290/core'

async function createUser(ctx: SDKContext, userData) {
  // Create user in database
  const user = await ctx.db.insert(users).values(userData)

  // Emit event for other plugins to react
  ctx.eventBus.emit('user.created', {
    id: user.id,
    email: user.email,
    createdAt: new Date(),
  })

  return user
}
```

### Listening to Events

```typescript
const myPlugin = createPlugin({
  name: 'my-plugin',

  async init(ctx) {
    // Listen to user creation
    ctx.eventBus.on('user.created', async (user) => {
      ctx.logger.info('New user created', { userId: user.id })

      // Send welcome email
      await sendWelcomeEmail(user.email)

      // Track analytics
      await trackSignup(user.id)
    })
  },
})
```

## Event Methods

### `on(event, listener)`

Subscribe to an event:

```typescript
ctx.eventBus.on('user.created', (user) => {
  console.log('User created:', user.id)
})

// Listener with context
ctx.eventBus.on('email.sent', async (data) => {
  await ctx.db.update(emailHistory).set({ status: 'sent' }).where(eq(emailHistory.id, data.emailId))
})
```

### `once(event, listener)`

Listen only once (auto-removes after first trigger):

```typescript
ctx.eventBus.once('app.ready', () => {
  console.log('App is ready - this runs only once')
})
```

### `off(event, listener)`

Remove a listener:

```typescript
const listener = (user) => console.log(user)

ctx.eventBus.on('user.updated', listener)
// Later...
ctx.eventBus.off('user.updated', listener)
```

### `emit(event, data)`

Emit an event to all listeners:

```typescript
ctx.eventBus.emit('user.login', {
  userId: '123',
  ipAddress: '127.0.0.1',
  timestamp: new Date(),
})
```

### `removeAllListeners(event?)`

Remove all listeners for an event (or all events):

```typescript
// Remove all listeners for specific event
ctx.eventBus.removeAllListeners('user.created')

// Remove ALL listeners (use with caution!)
ctx.eventBus.removeAllListeners()
```

## Standard Events

SV-SDK defines standard events that plugins emit:

### Authentication Events

```typescript
// User signup
'user.signup' → { id, email, name, role }

// User login
'user.login' → { id, email, ipAddress, timestamp }

// User logout
'user.logout' → { id, sessionId }

// Failed login
'user.login.failed' → { email, reason, ipAddress }

// User created
'user.created' → { id, email, name, role, createdBy }

// User updated
'user.updated' → { id, changes, updatedBy }

// User deleted
'user.deleted' → { id, deletedBy }

// Password changed
'user.password.changed' → { id, timestamp }
```

### Permission Events

```typescript
// Role assigned
'role.assigned' → { userId, roleId, assignedBy }

// Role revoked
'role.revoked' → { userId, roleId, revokedBy }

// Permission denied
'permission.denied' → { userId, permission, resource }
```

### Email Events

```typescript
// Email queued
'email.queued' → { id, template, recipient }

// Email sent
'email.sent' → { id, messageId, provider }

// Email failed
'email.failed' → { id, error, attempts }

// Email delivered
'email.delivered' → { id, timestamp }

// Email bounced
'email.bounced' → { id, reason }

// Email opened
'email.opened' → { id, timestamp }

// Email clicked
'email.clicked' → { id, link, timestamp }
```

### Audit Events

```typescript
// Audit log created
'audit.logged' → { event, userId, resource }
```

### System Events

```typescript
// SDK initialized
'sdk.initialized' → { version, plugins }

// Plugin loaded
'plugin.loaded' → { name, version }

// Plugin ready
'plugin.ready' → { name }

// Shutdown started
'sdk.shutdown' → { reason }
```

## Event Patterns

### Request-Response Pattern

Use events for async request-response:

```typescript
// Requester plugin
ctx.eventBus.emit('cache.get', {
  key: 'user:123',
  callback: (value) => {
    console.log('Got value:', value)
  },
})

// Responder plugin
ctx.eventBus.on('cache.get', async ({ key, callback }) => {
  const value = await redis.get(key)
  callback(value)
})
```

### Fan-out Pattern

Multiple plugins react to same event:

```typescript
// One event emitted
ctx.eventBus.emit('order.created', order)

// Multiple listeners react
emailPlugin: ctx.eventBus.on('order.created', sendOrderEmail)
analyticsPlugin: ctx.eventBus.on('order.created', trackOrder)
inventoryPlugin: ctx.eventBus.on('order.created', updateStock)
auditPlugin: ctx.eventBus.on('order.created', logOrder)
```

### Event Chain

Events triggering other events:

```typescript
// User signs up
ctx.eventBus.emit('user.signup', user)

// Plugin 1: Create profile
ctx.eventBus.on('user.signup', async (user) => {
  const profile = await createProfile(user)
  ctx.eventBus.emit('profile.created', profile)
})

// Plugin 2: Send welcome email
ctx.eventBus.on('profile.created', async (profile) => {
  await sendWelcomeEmail(profile.email)
  ctx.eventBus.emit('email.sent', { recipient: profile.email })
})
```

## Type-Safe Events

Define event types for type safety:

```typescript
// Define event types
interface EventMap {
  'user.created': {
    id: string
    email: string
    name: string
  }
  'user.login': {
    id: string
    ipAddress: string
  }
  'email.sent': {
    id: string
    recipient: string
    template: string
  }
}

// Type-safe event bus
import { TypedEventBus } from '@big0290/core'

const eventBus = new TypedEventBus<EventMap>()

// Type-checked emit
eventBus.emit('user.created', {
  id: '123',
  email: 'user@example.com',
  name: 'John',
})

// Type-checked listener
eventBus.on('user.created', (user) => {
  // user is typed as { id: string, email: string, name: string }
  console.log(user.email)
})
```

## Error Handling

### Handle Listener Errors

```typescript
ctx.eventBus.on('user.created', async (user) => {
  try {
    await sendWelcomeEmail(user.email)
  } catch (error) {
    ctx.logger.error('Failed to send welcome email', error)
    // Don't throw - other listeners should still run
  }
})
```

### Event Bus Error Events

Listen to errors from other listeners:

```typescript
ctx.eventBus.on('error', ({ event, error, listener }) => {
  ctx.logger.error('Event listener error', {
    event,
    error: error.message,
    stack: error.stack,
  })
})
```

## Best Practices

### 1. Use Descriptive Event Names

```typescript
// ✅ Good - descriptive and namespaced
'user.created'
'user.login.failed'
'email.sent'

// ❌ Bad - vague
'created'
'failed'
'sent'
```

### 2. Include Relevant Data

```typescript
// ✅ Good - enough info for listeners
ctx.eventBus.emit('user.created', {
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: new Date(),
})

// ❌ Bad - not enough info
ctx.eventBus.emit('user.created', { id: user.id })
```

### 3. Don't Rely on Event Order

Events may be processed in any order:

```typescript
// ❌ Bad - assumes order
ctx.eventBus.on('user.created', handler1) // Runs first?
ctx.eventBus.on('user.created', handler2) // Runs second?

// ✅ Good - each handler is independent
ctx.eventBus.on('user.created', independentHandler1)
ctx.eventBus.on('user.created', independentHandler2)
```

### 4. Remove Listeners on Cleanup

```typescript
const myPlugin = createPlugin({
  name: 'my-plugin',

  async init(ctx) {
    this.listener = (user) => console.log(user)
    ctx.eventBus.on('user.created', this.listener)
  },

  async onDestroy() {
    // Clean up
    ctx.eventBus.off('user.created', this.listener)
  },
})
```

### 5. Use Event Bus for Cross-Plugin Communication

```typescript
// ❌ Bad - direct dependency
import { emailService } from '@big0290/email'
await emailService.send(...)

// ✅ Good - event-based communication
ctx.eventBus.emit('email.send', {
  template: 'welcome',
  recipient: user.email
})
```

### 6. Document Your Events

```typescript
/**
 * Emitted when a new user is created
 *
 * @event user.created
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {Date} createdAt - Creation timestamp
 */
ctx.eventBus.emit('user.created', { ... })
```

## Debugging Events

### Log All Events

```typescript
const sdk = await createSDK({
  config: {
    debug: true  // Enables event logging
  },
  plugins: [...]
})
```

### Custom Event Logger

```typescript
ctx.eventBus.onAny((event, data) => {
  ctx.logger.debug('Event emitted', {
    event,
    data,
    listenerCount: ctx.eventBus.listenerCount(event),
  })
})
```

### Count Listeners

```typescript
const count = ctx.eventBus.listenerCount('user.created')
console.log(`${count} listeners for user.created`)
```

## Performance Considerations

### Async Listeners

Listeners are called asynchronously but sequentially:

```typescript
ctx.eventBus.on('user.created', async (user) => {
  await slowOperation() // Blocks other listeners
})

// Better: Use queue for slow operations
ctx.eventBus.on('user.created', async (user) => {
  await addToQueue('process-user', user) // Quick
})
```

### Avoid Heavy Computation

```typescript
// ❌ Bad - heavy computation in listener
ctx.eventBus.on('user.created', async (user) => {
  await generateReport(user) // Slow
  await processAnalytics(user) // Slow
})

// ✅ Good - queue for heavy work
ctx.eventBus.on('user.created', async (user) => {
  await addToQueue('generate-report', user)
  await addToQueue('process-analytics', user)
})
```

### Limit Listeners

Too many listeners can impact performance:

```typescript
// Check listener count
const maxListeners = ctx.eventBus.getMaxListeners()
const currentCount = ctx.eventBus.listenerCount('user.created')

if (currentCount > maxListeners) {
  ctx.logger.warn('Too many listeners', {
    event: 'user.created',
    count: currentCount,
  })
}
```

## Real-World Example

Complete example of event-driven workflow:

```typescript
// Auth plugin - emits events
const authPlugin = createPlugin({
  name: 'auth',
  async init(ctx) {
    ctx.registerService('auth', {
      signup: async (userData) => {
        const user = await ctx.db.insert(users).values(userData)
        ctx.eventBus.emit('user.signup', user)
        return user
      },
    })
  },
})

// Email plugin - listens and emits
const emailPlugin = createPlugin({
  name: 'email',
  dependencies: ['auth'],
  async init(ctx) {
    ctx.eventBus.on('user.signup', async (user) => {
      const result = await sendWelcomeEmail(user.email)
      ctx.eventBus.emit('email.sent', {
        recipient: user.email,
        template: 'welcome',
        messageId: result.messageId,
      })
    })
  },
})

// Analytics plugin - listens
const analyticsPlugin = createPlugin({
  name: 'analytics',
  async init(ctx) {
    ctx.eventBus.on('user.signup', async (user) => {
      await trackEvent('signup', { userId: user.id })
    })

    ctx.eventBus.on('email.sent', async (data) => {
      await trackEvent('email_sent', {
        recipient: data.recipient,
        template: data.template,
      })
    })
  },
})

// Audit plugin - listens
const auditPlugin = createPlugin({
  name: 'audit',
  async init(ctx) {
    // Log all user events
    ctx.eventBus.on('user.signup', async (user) => {
      await logAudit('user.signup', {
        userId: user.id,
        email: user.email,
      })
    })
  },
})
```

## Next Steps

- [Plugin System →](/core-concepts/plugin-system)
- [Architecture →](/core-concepts/architecture)
