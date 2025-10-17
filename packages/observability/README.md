# @sv-sdk/observability

Observability and monitoring package for SV-SDK with metrics collection, health probes, and integrations.

## Features

- **Metrics Collection** - Track application metrics
- **Health Probes** - Kubernetes-compatible health checks
- **Automatic Tracking** - Request latency, errors, queue depth
- **Redis-Backed** - Persistent metrics storage
- **Lightweight** - Minimal performance impact

## Installation

```bash
pnpm add @sv-sdk/observability
```

## Usage

### Metrics

```typescript
import { trackRequestLatency, trackError, trackEmailSend } from '@sv-sdk/observability'

// Track request latency
await trackRequestLatency('/api/users', 45) // 45ms

// Track errors
await trackError('ValidationError', '/api/login')

// Track email sends
await trackEmailSend('brevo', 'success')
```

### Health Probes

```typescript
import { livenessProbe, readinessProbe, startupProbe } from '@sv-sdk/observability'

// Liveness probe (is app running?)
const liveness = livenessProbe()
// { alive: true, timestamp: '2024-01-15T10:00:00.000Z' }

// Readiness probe (can app handle traffic?)
const readiness = await readinessProbe()
// { ready: true, services: [{ name: 'database', ready: true }, ...], timestamp: '...' }

// Startup probe (has app finished starting?)
const startup = await startupProbe()
// { started: true, timestamp: '...' }
```

### SvelteKit Integration

```typescript
// src/routes/health/live/+server.ts
import { livenessProbe } from '@sv-sdk/observability'

export async function GET() {
  const result = livenessProbe()
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// src/routes/health/ready/+server.ts
import { readinessProbe } from '@sv-sdk/observability'

export async function GET() {
  const result = await readinessProbe()
  return new Response(JSON.stringify(result), {
    status: result.ready ? 200 : 503,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Metrics Reporter

```typescript
import { createMetricsReporter } from '@sv-sdk/observability'

// Create reporter
const reporter = createMetricsReporter({
  interval: 60000, // Report every minute
  console: true, // Log to console
  reporter: async (metrics) => {
    // Custom reporting (e.g., send to Prometheus)
    console.log('Metrics:', metrics)
  },
})

// Start reporting
reporter.start()

// Stop reporting
reporter.stop()
```

## Available Metrics

**Counters**:
- `http_requests_total` - Total HTTP requests
- `errors_total` - Total errors
- `emails_sent_total` - Total emails sent
- `cache_requests_total` - Total cache requests

**Gauges**:
- `queue_depth` - Current queue depth
- `db_pool_active` - Active database connections
- `db_pool_idle` - Idle database connections

**Histograms**:
- `http_request_duration_ms` - Request latency
- `db_query_duration_ms` - Database query latency
- `cache_operation_duration_ms` - Cache operation latency

## Kubernetes Health Checks

Configure in your deployment:

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: app
      livenessProbe:
        httpGet:
          path: /health/live
          port: 3000
        initialDelaySeconds: 10
        periodSeconds: 10

      readinessProbe:
        httpGet:
          path: /health/ready
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5

      startupProbe:
        httpGet:
          path: /health/startup
          port: 3000
        initialDelaySeconds: 0
        periodSeconds: 2
        failureThreshold: 30
```

## Monitoring Integrations

### Prometheus (Future)

```typescript
// Export metrics in Prometheus format
import { createMetricsReporter } from '@sv-sdk/observability'

const reporter = createMetricsReporter({
  reporter: async (metrics) => {
    // Format as Prometheus metrics
    const formatted = metrics.map(m => 
      `${m.name} ${m.value} ${m.timestamp.getTime()}`
    ).join('\n')
    
    // Expose on /metrics endpoint
  }
})
```

### Grafana (Future)

Use Prometheus datasource to visualize metrics in Grafana dashboards.

### Sentry (Future)

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## Best Practices

1. **Track important events** - Requests, errors, business metrics
2. **Use labels** - Categorize metrics (endpoint, status, provider)
3. **Set up alerts** - Based on metric thresholds
4. **Monitor trends** - Track metrics over time
5. **Keep metrics lightweight** - Avoid high-cardinality labels

## Performance

**Metric Collection**:
- Latency: < 1ms
- Memory: < 10MB for 10,000 metrics
- Storage: Redis (persistent)

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## License

MIT

