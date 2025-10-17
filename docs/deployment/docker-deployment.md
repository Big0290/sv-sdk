# Docker Deployment Guide

Deploy SV-SDK using Docker containers.

---

## Production Dockerfile

Create `Dockerfile` in root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@8.15.0

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "apps/admin/build/index.js"]
```

---

## Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      EMAIL_PROVIDER: ${EMAIL_PROVIDER}
      BREVO_API_KEY: ${BREVO_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk
      POSTGRES_USER: sv_sdk_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sv_sdk_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## Building for Production

```bash
# Build Docker image
docker build -t sv-sdk:latest .

# Tag for registry
docker tag sv-sdk:latest registry.example.com/sv-sdk:latest

# Push to registry
docker push registry.example.com/sv-sdk:latest
```

---

## Running in Production

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=3

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## Environment Variables

Store in `.env.production` (never commit):

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db.example.com:5432/sv_sdk
REDIS_URL=redis://:pass@redis.example.com:6379
BETTER_AUTH_SECRET=<32-char-random-string>
BETTER_AUTH_URL=https://app.example.com
EMAIL_PROVIDER=brevo
BREVO_API_KEY=<your-api-key>
DB_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
```

---

## Health Checks

Configure load balancer health checks:

- **Liveness**: `GET /health/live` (should return 200)
- **Readiness**: `GET /health/ready` (should return 200 when ready)

---

## Logging

Container logs are sent to stdout/stderr:

```bash
# View logs
docker logs sv-sdk-app

# Follow logs
docker logs -f sv-sdk-app

# With timestamps
docker logs -f --timestamps sv-sdk-app
```

Configure log shipping (e.g., to ELK stack):

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Monitoring

### Container Monitoring

```bash
# Check container stats
docker stats

# Specific container
docker stats sv-sdk-app
```

### Application Monitoring

Configure in application:
- Sentry for errors
- Prometheus for metrics
- Health check monitoring

---

## Scaling

### Horizontal Scaling

```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Scale queue workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=5
```

### Load Balancing

Use nginx or cloud load balancer:

```nginx
upstream sv_sdk {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://sv_sdk;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Security Hardening

### Run as Non-Root User

```dockerfile
# Add to Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### Read-Only Filesystem

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.cache
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Backup Strategy

### Automated Backups

```bash
# Daily database backup
0 2 * * * docker exec sv-sdk-postgres pg_dump -U sv_sdk_user sv_sdk | gzip > /backups/sv_sdk-$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "sv_sdk-*.sql.gz" -mtime +30 -delete
```

### Backup Verification

```bash
# Weekly restore test
psql $TEST_DATABASE_URL < latest_backup.sql
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs sv-sdk-app

# Check environment
docker exec sv-sdk-app env

# Shell into container
docker exec -it sv-sdk-app sh
```

### High Memory Usage

```bash
# Check memory stats
docker stats sv-sdk-app

# Restart container
docker restart sv-sdk-app
```

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)

