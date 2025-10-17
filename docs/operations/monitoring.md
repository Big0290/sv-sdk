# Monitoring & Alerting Guide

Comprehensive monitoring setup for SV-SDK.

---

## Key Metrics

### Application Metrics

**Request Metrics**:
- Total requests
- Request latency (p50, p95, p99)
- Error rate
- Success rate

**User Metrics**:
- Active sessions
- Login attempts
- Signup rate
- User count

**Email Metrics**:
- Emails queued
- Emails sent
- Delivery rate
- Bounce rate
- Open rate

**Queue Metrics**:
- Queue depth
- Processing rate
- Failed jobs
- Job latency

### Infrastructure Metrics

**Database**:
- Connection pool usage
- Query latency
- Slow queries
- Active connections
- Database size

**Redis**:
- Memory usage
- Cache hit rate
- Connected clients
- Command latency
- Evictions

**Application**:
- CPU usage
- Memory usage
- Response time
- Error rate
- Uptime

---

## Health Check Endpoints

### Liveness Probe

**Endpoint**: `GET /health/live`

**Purpose**: Is the application running?

**Response**:
```json
{
  "alive": true,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**Alert**: If returns non-200, restart application

### Readiness Probe

**Endpoint**: `GET /health/ready`

**Purpose**: Can the application handle traffic?

**Response**:
```json
{
  "ready": true,
  "services": [
    { "name": "database", "ready": true },
    { "name": "redis", "ready": true }
  ],
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**Alert**: If returns 503, don't send traffic

---

## Alert Rules

### Critical Alerts (SEV-1)

**Application Down**:
```
Condition: Health check fails for 2 consecutive checks
Action: Page on-call immediately
```

**High Error Rate**:
```
Condition: Error rate > 10% over 5 minutes
Action: Page on-call immediately
```

**Database Down**:
```
Condition: Database health check fails
Action: Page on-call immediately
```

### Warning Alerts (SEV-2)

**Elevated Error Rate**:
```
Condition: Error rate > 5% over 10 minutes
Action: Notify on-call
```

**Slow Response Time**:
```
Condition: p95 latency > 1 second over 10 minutes
Action: Notify on-call
```

**High Queue Depth**:
```
Condition: Email queue > 10,000 jobs for 15 minutes
Action: Notify on-call
```

**High Memory Usage**:
```
Condition: Memory usage > 85% for 10 minutes
Action: Notify team
```

### Info Alerts (SEV-3)

**High Traffic**:
```
Condition: Requests > 2x baseline
Action: Notify team (informational)
```

**Cache Miss Rate**:
```
Condition: Cache hit rate < 70%
Action: Notify team (investigate caching)
```

---

## Monitoring Tools

### Sentry (Error Tracking)

**Setup**:
```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**Alerts**:
- New error types
- Error rate spike
- Performance degradation

### Prometheus (Metrics)

**Metrics Endpoint**: `GET /metrics`

**Sample Metrics**:
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/users",status="200"} 1543

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{endpoint="/api/users",le="0.1"} 1234
```

### Grafana (Dashboards)

**Dashboards**:
1. **Application Overview**
   - Request rate
   - Error rate
   - Response time
   - Active users

2. **Database**
   - Connection pool
   - Query latency
   - Slow queries
   - Table sizes

3. **Email**
   - Send rate
   - Delivery rate
   - Bounce rate
   - Queue depth

4. **Infrastructure**
   - CPU, Memory
   - Network I/O
   - Disk usage

---

## Log Aggregation

### Structured Logging

All logs in JSON format:

```json
{
  "level": "error",
  "message": "Failed to send email",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "context": {
    "userId": "user-123",
    "requestId": "req-456"
  },
  "error": {
    "name": "ExternalServiceError",
    "message": "Brevo API timeout"
  }
}
```

### Log Queries

**Common Queries**:

```
# Errors in last hour
level:error AND timestamp:[now-1h TO now]

# Specific user activity
userId:"user-123"

# Failed login attempts
eventType:"user.login.failed" AND timestamp:[now-24h TO now]

# Slow requests
http_duration_ms:>1000
```

---

## Dashboards

### Application Dashboard

**Metrics**:
- Requests per minute
- Error rate %
- p95 latency
- Active sessions

### Database Dashboard

**Metrics**:
- Connections (active/idle)
- Query latency
- Queries per second
- Cache hit rate

### Business Dashboard

**Metrics**:
- User signups (daily)
- Active users
- Email delivery rate
- System uptime

---

## On-Call Procedures

### On-Call Rotation

- Primary on-call
- Secondary on-call
- Escalation contacts

### On-Call Responsibilities

1. **Respond** to alerts within SLA
2. **Investigate** and resolve incidents
3. **Escalate** if needed
4. **Document** incidents and resolutions
5. **Update** runbooks

### Handoff Process

- Review open incidents
- Share context
- Update on-call schedule

---

## Useful Commands

```bash
# Check system health
sdk health

# View application logs
docker-compose logs -f app

# Check queue depth
sdk email stats

# View recent errors
# (in your monitoring tool)

# Restart service
docker-compose restart app

# Scale workers
docker-compose up -d --scale worker=5
```

---

## Escalation Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| On-Call Engineer | [Contact] | Immediate |
| Senior Engineer | [Contact] | 30 minutes |
| Engineering Manager | [Contact] | SEV-1 only |
| DevOps Lead | [Contact] | Infrastructure issues |
| Security Team | [Contact] | Security incidents |

---

## External Contacts

| Service | Support Contact |
|---------|-----------------|
| Hosting Provider | [Contact] |
| Database Provider | [Contact] |
| Email Provider (Brevo) | [Contact] |
| CDN Provider | [Contact] |

