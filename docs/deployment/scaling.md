# Scaling Guide

How to scale SV-SDK for high traffic and large user bases.

---

## Scaling Overview

SV-SDK is designed for horizontal scaling:
- **Stateless applications** can scale infinitely
- **Database** can use read replicas
- **Redis** can use clustering
- **Queue workers** can scale independently

---

## Horizontal Scaling

### Application Instances

**When to Scale**:
- CPU > 70% average
- Memory > 80%
- Response time > 500ms (p95)

**How to Scale**:

**Docker Compose**:
```bash
docker-compose up -d --scale app=5
```

**Kubernetes**:
```yaml
spec:
  replicas: 5  # Or use HPA
```

**Load Balancing**:
- Use nginx, HAProxy, or cloud load balancer
- Algorithm: Least connections
- Health checks: `/health/ready`

### Queue Workers

**When to Scale**:
- Queue depth > 10,000
- Job processing time > 5 seconds
- Worker CPU > 80%

**How to Scale**:

```bash
# Docker Compose
docker-compose up -d --scale worker=10

# Kubernetes
kubectl scale deployment email-worker --replicas=10
```

**Auto-scaling** (Kubernetes):
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: email-worker
spec:
  scaleTargetRef:
    kind: Deployment
    name: email-worker
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: External
      external:
        metric:
          name: queue_depth
        target:
          type: Value
          value: "1000"  # Scale when queue > 1000
```

---

## Database Scaling

### Vertical Scaling

**When**:
- CPU consistently > 80%
- High write volume
- Complex queries

**How**:
- Increase instance size (RDS, Cloud SQL)
- More CPU, RAM
- Faster storage (IOPS)

**AWS RDS Example**:
```bash
# Upgrade to larger instance
aws rds modify-db-instance \
  --db-instance-identifier sv-sdk-prod \
  --db-instance-class db.m5.xlarge \
  --apply-immediately
```

### Read Replicas

**When**:
- Read:Write ratio > 70:30
- Reporting queries slow down app
- Geographic distribution needed

**Setup** (AWS RDS):
```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier sv-sdk-replica-1 \
  --source-db-instance-identifier sv-sdk-prod \
  --availability-zone us-east-1b
```

**Application Configuration**:
```typescript
// Write to primary
const user = await db.insert(users).values(data)

// Read from replica
const users = await dbReplica.select().from(users)
```

### Connection Pooling

**Optimize pool size**:
```bash
# Formula: (core_count * 2) + effective_spindle_count
DB_POOL_MIN=5
DB_POOL_MAX=20
```

**Use connection pooler** (PgBouncer):
```bash
# Install PgBouncer
docker run -d -p 6432:6432 \
  -e DATABASES_HOST=postgres \
  -e DATABASES_PORT=5432 \
  pgbouncer/pgbouncer
```

---

## Redis Scaling

### Vertical Scaling

```bash
# Increase memory
# AWS ElastiCache example
aws elasticache modify-cache-cluster \
  --cache-cluster-id sv-sdk-redis \
  --cache-node-type cache.m5.large
```

### Redis Cluster

For > 50GB data:

```bash
# Create cluster
aws elasticache create-replication-group \
  --replication-group-id sv-sdk-cluster \
  --num-node-groups 3 \
  --replicas-per-node-group 2
```

### Eviction Policy

```bash
# Configure eviction
maxmemory-policy allkeys-lru  # Remove least recently used
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| API Latency (p95) | < 100ms | TBD |
| Database Query (p95) | < 50ms | TBD |
| Permission Check (cached) | < 5ms | TBD |
| Email Queue Throughput | > 100/sec | TBD |
| Cache Hit Rate | > 80% | TBD |

### Load Testing

**Use Artillery or K6**:

```bash
# Install k6
brew install k6

# Run load test
k6 run test/load/api-test.js
```

**Example Load Test**:
```javascript
// test/load/api-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m',
}

export default function () {
  const res = http.get('http://localhost:3000/api/v1/users')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })
  sleep(1)
}
```

---

## Cost Optimization

### Application Scaling

**Right-size instances**:
- Start small (t3.small)
- Monitor CPU/memory
- Scale up when consistently > 70%

**Auto-scaling**:
- Scale down during off-peak
- Save 30-50% on costs

### Database Optimization

**Use Reserved Instances**:
- 40% savings for predictable workloads

**Read Replicas vs Larger Instance**:
- Read replicas often cheaper than vertical scaling

### Redis Optimization

**Use appropriate tier**:
- cache.t3.micro for < 1GB
- cache.t3.small for 1-3GB
- Avoid over-provisioning

### Email Cost Optimization

**Choose provider wisely**:
- Brevo: Good for medium volume
- AWS SES: Best for high volume ($0.10/1000)
- SendGrid: Alternative

**Monitor costs**:
```bash
pnpm sdk email stats
# Calculate: (sent / 1000) * provider_rate
```

---

## Monitoring Scaling

### Key Metrics to Watch

1. **Application**:
   - Response time (p50, p95, p99)
   - Error rate
   - Request rate
   - CPU and memory usage

2. **Database**:
   - Connection pool usage
   - Query latency
   - Slow queries
   - Replication lag (if using replicas)

3. **Redis**:
   - Memory usage
   - Hit/miss rate
   - Command latency
   - Evictions

4. **Queue**:
   - Queue depth
   - Processing rate
   - Job latency
   - Failed jobs

### Alerts

Set up alerts for:
- Queue depth > 10,000
- Database CPU > 80%
- Redis memory > 90%
- Application response time > 1s
- Error rate > 5%

---

## Scaling Triggers

### Auto-scaling Rules

**Application Instances**:
```yaml
# Scale up when
- CPU > 70% for 5 minutes
- OR response time > 500ms for 5 minutes

# Scale down when
- CPU < 30% for 10 minutes
- AND response time < 200ms

# Limits
minReplicas: 3
maxReplicas: 20
```

**Queue Workers**:
```yaml
# Scale up when
- Queue depth > 1000 per worker
- OR job wait time > 60s

# Scale down when
- Queue depth < 100 per worker

# Limits
minReplicas: 2
maxReplicas: 50
```

---

## Scaling Roadmap

### Phase 1: Small (< 1,000 users)
- 2 app instances
- 1 database (db.t3.small)
- 1 Redis (cache.t3.micro)
- 2 workers

### Phase 2: Medium (1,000 - 10,000 users)
- 3-5 app instances
- 1 database (db.t3.medium)
- 1 Redis (cache.t3.small)
- 3-5 workers

### Phase 3: Large (10,000 - 100,000 users)
- 5-10 app instances
- 1 primary + 2 read replicas (db.m5.large)
- 1 Redis cluster
- 5-10 workers

### Phase 4: Enterprise (100,000+ users)
- 10+ app instances
- Multi-AZ database cluster
- Redis cluster with sharding
- 20+ workers
- CDN for static assets
- Geographic distribution

---

## Performance Optimization

### Database

1. **Indexes**: Ensure all foreign keys and frequently queried columns are indexed
2. **Query Optimization**: Use EXPLAIN ANALYZE
3. **Connection Pooling**: Tune pool size
4. **Prepared Statements**: Use with Drizzle
5. **Partitioning**: For audit logs > 10M rows

### Caching

1. **Cache Hot Data**: Users, permissions, templates
2. **TTL Strategy**: Balance freshness vs performance
3. **Cache Warming**: Preload common data
4. **Invalidation**: Precise cache invalidation

### Application

1. **Code Splitting**: Dynamic imports for large components
2. **Asset Optimization**: Compress images, minify JS/CSS
3. **HTTP/2**: Enable for multiplexing
4. **Compression**: Gzip or Brotli

---

## Troubleshooting Performance

### Slow Responses

**Check**:
1. Database query times (slow query log)
2. Cache hit rate
3. External API latency
4. Network latency

**Solutions**:
- Add database indexes
- Increase cache TTL
- Add request timeouts
- Use CDN for static assets

### High Memory Usage

**Check**:
1. Memory leaks (heap snapshots)
2. Large object retention
3. Cache size

**Solutions**:
- Fix memory leaks
- Reduce cache size
- Add garbage collection tuning

### Database Connection Exhaustion

**Check**:
1. Connection pool size
2. Slow queries holding connections
3. Connection leaks

**Solutions**:
- Increase pool size
- Optimize slow queries
- Fix connection leaks
- Use connection pooler (PgBouncer)

---

## Resources

- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis Memory Optimization](https://redis.io/docs/management/optimization/)
- [K8s Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [AWS Scaling Best Practices](https://aws.amazon.com/architecture/well-architected/)

