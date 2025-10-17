# Daily Development Workflow

A practical guide for working with the sv-sdk monorepo on a day-to-day basis.

---

## Table of Contents

1. [First-Time Setup](#first-time-setup)
2. [Daily Workflow](#daily-workflow)
3. [Common Development Tasks](#common-development-tasks)
4. [Working Across Packages](#working-across-packages)
5. [Testing Strategies](#testing-strategies)
6. [Debugging](#debugging)
7. [Troubleshooting](#troubleshooting)

---

## First-Time Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd sv-sdk

# Install all dependencies
pnpm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Minimum required:
# - DATABASE_URL
# - REDIS_URL
# - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
```

### 3. Start Services

```bash
# Start PostgreSQL and Redis via Docker
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs if something is wrong
docker-compose logs postgres
docker-compose logs redis
```

### 4. Initialize Database

```bash
# Generate Drizzle client and types
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (admin user, roles, templates)
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Start all dev servers (Turborepo orchestrates)
pnpm dev

# Access applications:
# - Admin: http://localhost:5173
# - Demo App: http://localhost:5174
```

---

## Daily Workflow

### Morning Routine

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Check if there are new migrations
pnpm db:migrate

# 4. Start services (if not already running)
docker-compose up -d

# 5. Start development
pnpm dev
```

### During Development

```bash
# Hot reload is enabled by default
# Edit files in packages/* or apps/*
# Changes automatically rebuild and refresh

# Check your changes compile
pnpm type-check

# Lint your code
pnpm lint

# Run tests for package you're working on
pnpm --filter @sv-sdk/auth test

# Or run all tests
pnpm test
```

### Before Committing

```bash
# 1. Lint and fix
pnpm lint:fix

# 2. Format code
pnpm format

# 3. Run type check
pnpm type-check

# 4. Run tests
pnpm test

# 5. Check build
pnpm build

# 6. Commit with conventional commit message
git add .
git commit -m "feat(auth): add password strength validation"
```

---

## Common Development Tasks

### Adding a New Feature

#### Example: Add Email Templates for User Onboarding

**1. Identify Packages Affected**

- `packages/email` - Add new template
- `apps/admin` - Add UI for template management
- `packages/auth` - Integrate template sending

**2. Update Email Package**

```bash
# Navigate to package
cd packages/email

# Create new template file
mkdir -p src/templates
touch src/templates/user_onboarding.mjml

# Edit template with MJML
# src/templates/user_onboarding.mjml

# Add template schema
# src/schemas.ts
export const userOnboardingSchema = z.object({
  userName: z.string(),
  dashboardUrl: z.string().url(),
})

# Run tests
pnpm test
```

**3. Update Admin App**

```bash
cd apps/admin

# Add new route for template management
# src/routes/templates/onboarding/+page.svelte

# Test locally
pnpm dev
```

**4. Integration Test**

```bash
# Return to root
cd ../..

# Run integration test
pnpm test:integration
```

### Adding a New Package

```bash
# Create package structure
mkdir -p packages/analytics
cd packages/analytics

# Initialize package.json
cat > package.json << EOF
{
  "name": "@sv-sdk/analytics",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@sv-sdk/db-config": "workspace:*",
    "@sv-sdk/shared": "workspace:*"
  }
}
EOF

# Create source structure
mkdir src
touch src/index.ts

# Add to workspace (already included via packages/* pattern)

# Install dependencies
pnpm install

# Start developing
pnpm dev
```

### Updating Dependencies

```bash
# Check for outdated dependencies
pnpm outdated

# Update specific dependency
pnpm update drizzle-orm

# Update all dependencies (careful!)
pnpm update --latest

# Verify everything still works
pnpm test
pnpm build
```

### Database Schema Changes

```bash
# 1. Edit schema file
# packages/db-config/src/schemas/auth.schema.ts

# 2. Generate migration
cd packages/db-config
pnpm db:generate

# 3. Review generated migration
# packages/db-config/migrations/0001_....sql

# 4. Run migration
pnpm db:migrate

# 5. Update seed data if needed
# packages/db-config/scripts/seed.ts

# 6. Test migration
pnpm test
```

---

## Working Across Packages

### Package Dependency Graph

```
@sv-sdk/shared
  └── @sv-sdk/db-config
      ├── @sv-sdk/validators
      │   └── @sv-sdk/security
      └── @sv-sdk/cache
          ├── @sv-sdk/core
          ├── @sv-sdk/auth
          ├── @sv-sdk/audit
          ├── @sv-sdk/permissions
          └── @sv-sdk/email
              └── @sv-sdk/ui
                  ├── apps/admin
                  └── apps/demo-app
```

### Importing from Another Package

```typescript
// In packages/auth/src/user-service.ts

// Import from shared package
import { ValidationError } from '@sv-sdk/shared'

// Import from db-config
import { db } from '@sv-sdk/db-config'
import { users } from '@sv-sdk/db-config/schemas/auth.schema'

// Import from cache
import { cacheGet, CACHE_TTL } from '@sv-sdk/cache'
```

### Testing Changes Across Packages

```bash
# Option 1: Run dev mode (watches all packages)
pnpm dev

# Option 2: Build specific packages
pnpm --filter @sv-sdk/auth build
pnpm --filter @sv-sdk/email build

# Option 3: Test integration
pnpm test:integration
```

### Debugging Cross-Package Issues

```bash
# Check package resolution
pnpm why @sv-sdk/auth

# Rebuild all packages
pnpm build

# Clear build cache and rebuild
rm -rf packages/*/dist
pnpm build

# Check for circular dependencies
pnpm --filter @sv-sdk/auth exec madge --circular src/index.ts
```

---

## Testing Strategies

### Unit Tests (Fast)

```bash
# Test specific package
pnpm --filter @sv-sdk/auth test

# Test with coverage
pnpm --filter @sv-sdk/auth test:coverage

# Test in watch mode (during development)
pnpm --filter @sv-sdk/auth test --watch

# Test specific file
pnpm --filter @sv-sdk/auth test src/user-service.test.ts
```

### Integration Tests (Medium)

```bash
# Run integration tests (requires services)
pnpm test:integration

# Run with fresh database
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm test:integration
```

### E2E Tests (Slow)

```bash
# Run E2E tests with Playwright
pnpm --filter apps/admin test:e2e

# Run with UI (for debugging)
pnpm --filter apps/admin test:e2e --ui

# Run specific test
pnpm --filter apps/admin test:e2e tests/login.spec.ts
```

### Test-Driven Development

```bash
# 1. Write failing test
# packages/auth/src/password-policy.test.ts

# 2. Run test (should fail)
pnpm --filter @sv-sdk/auth test --watch

# 3. Implement feature
# packages/auth/src/password-policy.ts

# 4. Test passes automatically (watch mode)

# 5. Refactor if needed

# 6. Commit
git add .
git commit -m "feat(auth): add password complexity check"
```

---

## Debugging

### Debugging Node.js Code

```bash
# Run package in debug mode
pnpm --filter @sv-sdk/auth dev --inspect

# Attach debugger in VS Code:
# 1. Set breakpoint in code
# 2. Press F5
# 3. Select "Attach to Node Process"
```

### Debugging Database Queries

```typescript
// Enable Drizzle query logging
import { drizzle } from 'drizzle-orm/postgres-js'

export const db = drizzle(sql, {
  schema,
  logger: true, // 👈 Enable query logging
})
```

```bash
# Watch database queries in real-time
docker-compose exec postgres psql -U sv_sdk_user -d sv_sdk
# In psql:
ALTER DATABASE sv_sdk SET log_statement = 'all';
```

### Debugging Redis

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli -a ${REDIS_PASSWORD}

# Monitor all commands
127.0.0.1:6379> MONITOR

# Check specific key
127.0.0.1:6379> GET user:123

# List all keys (careful in production!)
127.0.0.1:6379> KEYS *

# Check queue jobs
127.0.0.1:6379> LRANGE bull:emails:active 0 -1
```

### Debugging Email Sending

```bash
# Use mock provider in development
EMAIL_PROVIDER=mock pnpm dev

# Check mock emails
ls emails/

# Open in browser
open emails/latest.html
```

### Debugging Type Errors

```bash
# Type check specific package
pnpm --filter @sv-sdk/auth type-check

# Generate types and check again
pnpm db:generate
pnpm type-check

# Clear TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo
pnpm type-check
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5173  # Admin app

# Kill processes using ports
kill -9 <PID>

# Restart services
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection manually
psql postgresql://sv_sdk_user:password@localhost:5432/sv_sdk

# Reset database
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm db:seed
```

### Migration Failures

```bash
# Check migration history
psql postgresql://...

# In psql:
SELECT * FROM drizzle_migrations ORDER BY created_at DESC;

# Rollback last migration (if supported)
pnpm db:rollback

# Or manually delete migration record and rerun
DELETE FROM drizzle_migrations WHERE id = <migration_id>;

# Then rerun
pnpm db:migrate
```

### Build Failures

```bash
# Clear all build artifacts
pnpm clean

# Rebuild from scratch
pnpm install --force
pnpm build

# Check for circular dependencies
pnpm --filter @sv-sdk/<package> exec madge --circular src/index.ts
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} ping
# Should return: PONG

# Check password
echo $REDIS_PASSWORD
```

### Hot Reload Not Working

```bash
# Check file watchers (macOS)
sysctl -w kern.maxfiles=65536
sysctl -w kern.maxfilesperproc=65536

# Restart dev server
pkill -f "vite"
pnpm dev
```

### pnpm Lock File Conflicts

```bash
# If merge conflict in pnpm-lock.yaml
git checkout --theirs pnpm-lock.yaml
pnpm install
```

---

## Performance Tips

### Speed Up Development

1. **Use turbo cache**:

   ```bash
   # Turbo caches build outputs
   pnpm build  # Slow first time
   pnpm build  # Fast subsequent times
   ```

2. **Run only affected packages**:

   ```bash
   # Only rebuild packages that changed
   pnpm build --filter ...[origin/main]
   ```

3. **Use watch mode for tests**:

   ```bash
   # Only reruns tests for changed files
   pnpm test --watch

   ```

4. **Parallel execution**:

   ```bash
   # Turbo runs independent tasks in parallel
   pnpm test  # Runs all package tests in parallel
   ```

---

## Useful Commands Cheat Sheet

```bash
# Development
pnpm dev                                    # Start all dev servers
pnpm dev --filter @sv-sdk/auth              # Start specific package
pnpm build                                  # Build all packages
pnpm build --filter apps/admin              # Build specific app

# Database
pnpm db:generate                            # Generate Drizzle types
pnpm db:migrate                             # Run migrations
pnpm db:seed                                # Seed database
pnpm db:studio                              # Open Drizzle Studio

# Testing
pnpm test                                   # Run all tests
pnpm test:unit                              # Unit tests only
pnpm test:integration                       # Integration tests
pnpm test:e2e                               # E2E tests
pnpm test:coverage                          # Generate coverage

# Code Quality
pnpm lint                                   # Lint all packages
pnpm lint:fix                               # Auto-fix issues
pnpm format                                 # Format code
pnpm type-check                             # TypeScript check

# Services
docker-compose up -d                        # Start services
docker-compose down                         # Stop services
docker-compose logs -f postgres             # Watch logs
docker-compose ps                           # List services

# Cleanup
pnpm clean                                  # Remove build artifacts
docker-compose down -v                      # Remove volumes
rm -rf node_modules packages/*/node_modules # Deep clean
```

---

## Getting Help

1. **Check logs**: Most issues show up in logs

   ```bash
   pnpm dev  # Watch console output
   docker-compose logs -f  # Watch service logs
   ```

2. **Read error messages**: TypeScript and Drizzle have helpful errors

3. **Check documentation**: Each package has its own README

4. **Ask the team**: Share error messages and steps to reproduce

---

## Next Steps

- [Phase Dependencies](./PHASE_DEPENDENCIES.md) - Understand package relationships
- [Database Decision](./DATABASE_DECISION.md) - Database architecture rationale
- [Architecture](./ARCHITECTURE.md) - High-level system design (create after Phase 12)
