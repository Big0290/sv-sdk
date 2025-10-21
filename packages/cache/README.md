# @big0290/cache

Redis caching and BullMQ queue system for the SV-SDK platform.

## Features

- **Redis Client** with connection pooling and retry logic
- **Cache Utilities** for get/set/delete operations with JSON serialization
- **BullMQ Queue System** for background job processing
- **Health Checks** for monitoring Redis connection
- **Configuration Constants** for consistent key naming

## Installation

```bash
pnpm add @big0290/cache
```

## Configuration

Set the following environment variable:

```bash
REDIS_URL=redis://:password@localhost:6379
```

## Usage

### Cache Operations

```typescript
import { cacheGet, cacheSet, cacheDelete, CACHE_TTL, CACHE_KEYS } from '@big0290/cache'

// Set value with TTL
await cacheSet(CACHE_KEYS.user('123'), { name: 'John Doe', email: 'john@example.com' }, CACHE_TTL.MEDIUM)

// Get value
const user = await cacheGet<User>(CACHE_KEYS.user('123'))

// Delete value
await cacheDelete(CACHE_KEYS.user('123'))

// Delete pattern
await cacheDeletePattern('user:*')
```

### Queue Operations

```typescript
import { createQueue, createWorker, type Job } from '@big0290/cache'

// Create queue
const emailQueue = createQueue('emails')

// Add job to queue
await emailQueue.add(
  'send',
  {
    to: 'user@example.com',
    template: 'verification',
    variables: { userName: 'John' },
  },
  {
    priority: 1,
    attempts: 3,
  }
)

// Create worker to process jobs
const worker = createWorker('emails', async (job: Job) => {
  const { to, template, variables } = job.data

  // Send email
  console.log(`Sending email to ${to} using template ${template}`)

  return { success: true, messageId: 'msg-123' }
})

// Get queue metrics
const metrics = await getQueueMetrics(emailQueue)
// { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 0 }
```

### Health Checks

```typescript
import { checkRedisHealth, pingRedis } from '@big0290/cache'

// Quick health check
const healthy = await pingRedis()

// Detailed health check
const health = await checkRedisHealth()
// {
//   healthy: true,
//   status: 'ready',
//   latency: 15,
//   memory: { used: '1.5M', peak: '2.0M', fragmentation: '1.2' },
//   connectedClients: 5
// }
```

### Cache Keys

Use consistent key naming with factory functions:

```typescript
import { CACHE_KEYS } from '@big0290/cache'

// Predefined key patterns
CACHE_KEYS.user('123') // 'user:123'
CACHE_KEYS.session('abc') // 'session:abc'
CACHE_KEYS.permissions('user-456') // 'permissions:user-456'
CACHE_KEYS.rateLimit('127.0.0.1', '/api/login') // 'rate_limit:127.0.0.1:/api/login'

// Build custom keys
CACHE_KEYS.build('custom', 'key', '123') // 'custom:key:123'
```

### TTL Constants

```typescript
import { CACHE_TTL } from '@big0290/cache'

CACHE_TTL.SHORT // 60 seconds (1 minute)
CACHE_TTL.MEDIUM // 300 seconds (5 minutes)
CACHE_TTL.LONG // 3600 seconds (1 hour)
CACHE_TTL.DAY // 86400 seconds (24 hours)
CACHE_TTL.WEEK // 604800 seconds (7 days)
```

## Advanced Usage

### Multi-Get/Set

```typescript
import { cacheMultiGet, cacheMultiSet } from '@big0290/cache'

// Get multiple keys at once
const values = await cacheMultiGet<User>(['user:1', 'user:2', 'user:3'])

// Set multiple keys at once
await cacheMultiSet([
  { key: 'user:1', value: user1, ttl: 300 },
  { key: 'user:2', value: user2, ttl: 300 },
  { key: 'user:3', value: user3, ttl: 300 },
])
```

### Cache Increment/Decrement

```typescript
import { cacheIncrement, cacheDecrement } from '@big0290/cache'

// Increment counter
const newValue = await cacheIncrement('page:views', 1)

// Decrement counter
await cacheDecrement('rate_limit:user:123', 1)
```

### Queue Events

```typescript
import { createQueueEvents } from '@big0290/cache'

const queueEvents = createQueueEvents('emails')

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed with result:`, returnvalue)
})

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed:`, failedReason)
})

queueEvents.on('progress', ({ jobId, data }) => {
  console.log(`Job ${jobId} progress:`, data)
})
```

### Queue Management

```typescript
import { pauseQueue, resumeQueue, cleanQueue, drainQueue } from '@big0290/cache'

// Pause queue (stop processing new jobs)
await pauseQueue(queue)

// Resume queue
await resumeQueue(queue)

// Clean old completed jobs
await cleanQueue(queue, {
  grace: 24 * 3600 * 1000, // 24 hours
  limit: 1000,
  status: 'completed',
})

// Drain queue (remove all jobs)
await drainQueue(queue)
```

## Performance

**Cache Operations**:

- Get: < 5ms (local Redis)
- Set: < 5ms (local Redis)
- Multi-get (10 keys): < 10ms

**Queue Operations**:

- Add job: < 10ms
- Process job: Depends on processor
- Throughput: > 1000 jobs/second

## Best Practices

1. **Always set TTL** for cached data to prevent memory bloat
2. **Use cache key factories** for consistent naming
3. **Handle cache misses** gracefully (return default or fetch from DB)
4. **Monitor queue metrics** to prevent backlog
5. **Set appropriate retry strategies** for jobs
6. **Clean old jobs** regularly to prevent Redis memory issues

## Error Handling

All cache operations are wrapped with try-catch and log errors:

```typescript
try {
  await cacheSet('key', 'value')
} catch (error) {
  // Error is logged automatically
  // Operation fails but doesn't crash application
}
```

For critical operations, handle errors explicitly:

```typescript
const result = await cacheGet('critical-key')

if (result === null) {
  // Cache miss or error - fetch from database
  const data = await fetchFromDatabase()
  await cacheSet('critical-key', data, CACHE_TTL.MEDIUM)
  return data
}

return result
```

## Graceful Shutdown

Close connections on application shutdown:

```typescript
import { closeRedisConnection } from '@big0290/cache'

process.on('SIGTERM', async () => {
  await closeRedisConnection()
  process.exit(0)
})
```

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

Works seamlessly with:

- `@big0290/auth` - Session caching
- `@big0290/permissions` - Permission caching
- `@big0290/email` - Email queue processing
- `@big0290/security` - Rate limiting

## Monitoring

Monitor Redis health:

```typescript
import { checkRedisHealthDetailed } from '@big0290/cache'

setInterval(async () => {
  const health = await checkRedisHealthDetailed()

  if (!health.healthy) {
    console.error('Redis unhealthy:', health.errors)
  }

  console.log('Redis metrics:', health.metrics)
}, 60000) // Check every minute
```

## License

MIT
