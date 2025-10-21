# Performance Optimization Guide

Optimize SV-SDK for maximum performance.

---

## Performance Targets

| Metric                    | Target    | Critical |
| ------------------------- | --------- | -------- |
| API Response Time (p95)   | < 100ms   | < 500ms  |
| Database Query (p95)      | < 50ms    | < 200ms  |
| Permission Check (cached) | < 5ms     | < 20ms   |
| Email Queue Throughput    | > 100/sec | > 50/sec |
| Cache Hit Rate            | > 80%     | > 60%    |
| Page Load (FCP)           | < 1.5s    | < 3s     |

---

## Database Optimization

### Query Optimization

**Use EXPLAIN ANALYZE**:

```sql
EXPLAIN ANALYZE SELECT * FROM auth.users WHERE email = 'user@example.com';
```

**Add Indexes**:

```sql
-- Foreign keys
CREATE INDEX idx_sessions_user_id ON auth.sessions(userId);

-- WHERE clauses
CREATE INDEX idx_users_email ON auth.users(email);

-- ORDER BY clauses
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(createdAt DESC);

-- JSONB columns
CREATE INDEX idx_audit_logs_metadata ON audit.audit_logs USING GIN (metadata);
```

### Connection Pooling

**Optimize pool size**:

```bash
# In .env
DB_POOL_MIN=5
DB_POOL_MAX=20  # Formula: (cores * 2) + spindles
```

**Monitor connections**:

```sql
SELECT count(*) FROM pg_stat_activity;
```

### Prepared Statements

Drizzle ORM automatically uses prepared statements for repeated queries.

### N+1 Query Prevention

**Bad** (N+1 queries):

```typescript
const users = await db.select().from(users)
for (const user of users) {
  const roles = await db.select().from(userRoles).where(eq(userRoles.userId, user.id))
}
```

**Good** (single query):

```typescript
const usersWithRoles = await db.select().from(users).leftJoin(userRoles, eq(users.id, userRoles.userId))
```

---

## Caching Strategy

### Cache Layers

1. **Session Cache** (TTL: 5min)
   - User sessions for authentication

2. **Permission Cache** (TTL: 5min)
   - User permissions for authorization

3. **User Cache** (TTL: 5min)
   - User profile data

4. **Template Cache** (TTL: 1hour)
   - Email templates (rarely change)

### Cache Warming

Preload frequently accessed data:

```typescript
// On application startup
await Promise.all([cacheSet(CACHE_KEYS.emailTemplate('welcome', 'en'), template), cacheSet(CACHE_KEYS.roles(), roles)])
```

### Cache Invalidation

**Smart invalidation**:

```typescript
// On user update
await updateUser(userId, data)
await cacheDelete(CACHE_KEYS.user(userId))
await cacheDelete(CACHE_KEYS.permissions(userId))
```

### Monitoring Cache Performance

```typescript
import { trackCacheHit } from '@sv-sdk/observability'

const cached = await cacheGet(key)
trackCacheHit(!!cached)

// Monitor hit rate
// Target: > 80%
```

---

## Application Optimization

### Asset Optimization

**Images**:

- Use WebP format
- Compress with ImageOptim
- Serve via CDN
- Lazy load below fold

**JavaScript**:

```bash
# Vite automatically:
- Minifies code
- Tree-shakes unused code
- Code splits routes
```

**CSS**:

- Tailwind purges unused classes
- PostCSS minifies output

### Code Splitting

SvelteKit automatically code-splits by route.

**Dynamic imports** for heavy components:

```typescript
const Monaco = await import('monaco-editor')
```

### Lazy Loading

```svelte
{#await import('./HeavyComponent.svelte') then Component}
  <Component.default />
{:catch}
  <p>Failed to load component</p>
{/await}
```

---

## Redis Optimization

### Memory Optimization

**Use appropriate data structures**:

- Strings for simple values
- Hashes for objects
- Sets for unique lists
- Sorted sets for rankings

**Set eviction policy**:

```bash
maxmemory-policy allkeys-lru
```

### Command Pipelining

**Batch multiple commands**:

```typescript
const pipeline = redis.pipeline()
pipeline.get('key1')
pipeline.get('key2')
pipeline.get('key3')
const results = await pipeline.exec()
```

### Monitoring

```bash
# Check memory usage
redis-cli info memory

# Monitor slow commands
redis-cli slowlog get 10
```

---

## Queue Optimization

### Worker Configuration

```typescript
// Optimize concurrency
const worker = new Worker('email', processEmail, {
  connection: redis,
  concurrency: 5, // Process 5 jobs simultaneously
})
```

### Job Prioritization

```typescript
// High priority jobs first
await emailQueue.add('send', data, {
  priority: 1, // Lower number = higher priority
})
```

### Batch Processing

```typescript
// Process multiple emails in one job
await emailQueue.add('send-batch', {
  emails: [email1, email2, email3],
})
```

---

## CDN Configuration

### Static Assets

**Cloudflare, CloudFront, or similar**:

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### SvelteKit Adapter

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare'

export default {
  kit: {
    adapter: adapter(),
  },
}
```

---

## Network Optimization

### HTTP/2

Enable HTTP/2 for multiplexing:

```nginx
listen 443 ssl http2;
```

### Compression

**Gzip or Brotli**:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Keep-Alive

```nginx
keepalive_timeout 65;
keepalive_requests 100;
```

---

## Monitoring Performance

### Application Performance Monitoring (APM)

**Sentry**:

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of requests
})
```

**New Relic, Datadog** (alternatives)

### Real User Monitoring (RUM)

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Custom Metrics

```typescript
import { trackRequestLatency } from '@sv-sdk/observability'

const start = Date.now()
// ... operation ...
trackRequestLatency('/api/users', Date.now() - start)
```

---

## Performance Checklist

### Before Launch

- [ ] Database indexes created
- [ ] Caching enabled and tuned
- [ ] Asset optimization complete
- [ ] CDN configured
- [ ] Compression enabled
- [ ] HTTP/2 enabled
- [ ] Load tests passed
- [ ] APM configured

### Regular Maintenance

- [ ] Review slow query log weekly
- [ ] Monitor cache hit rates
- [ ] Check for N+1 queries
- [ ] Update dependencies
- [ ] Review bundle size
- [ ] Optimize images
- [ ] Clear old cache keys

---

## Performance Testing

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run test/load/api-load-test.yml
```

**Example config**:

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users/second
    - duration: 120
      arrivalRate: 50 # 50 users/second
scenarios:
  - flow:
      - get:
          url: '/api/v1/users'
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
```

---

## Common Bottlenecks

### Slow Database Queries

**Symptoms**: API latency > 500ms

**Solutions**:

- Add indexes
- Optimize query
- Use connection pool
- Add caching

### High Memory Usage

**Symptoms**: Memory > 80%, OOM errors

**Solutions**:

- Fix memory leaks
- Reduce cache size
- Scale vertically
- Add swap (temporary)

### Queue Backup

**Symptoms**: Queue depth > 10,000

**Solutions**:

- Scale workers
- Increase concurrency
- Optimize job processing
- Add job expiry

---

## Resources

- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [SvelteKit Performance](https://kit.svelte.dev/docs/performance)
