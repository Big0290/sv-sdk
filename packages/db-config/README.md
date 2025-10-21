# @big0290/db-config

Database configuration and schemas using Drizzle ORM for the SV-SDK platform.

## Features

- **Single PostgreSQL database** with 4 logical schemas (auth, email, audit, permissions)
- **Drizzle ORM** for type-safe database access
- **Automatic migrations** with Drizzle Kit
- **Connection pooling** (max 20 connections by default)
- **Health checks** and monitoring utilities
- **Seed scripts** for initial data
- **Zod validation** schemas auto-generated from Drizzle

## Architecture

### Database Structure

```
Database: sv_sdk
├── Schema: auth
│   ├── users
│   ├── sessions
│   ├── accounts
│   └── verifications
├── Schema: email
│   ├── email_templates
│   ├── email_sends
│   ├── email_webhooks
│   └── email_preferences
├── Schema: audit
│   └── audit_logs
└── Schema: permissions
    ├── roles
    ├── user_roles
    └── permission_cache
```

Why single database? See [DATABASE_DECISION.md](../../DATABASE_DECISION.md)

## Installation

```bash
pnpm add @big0290/db-config
```

## Configuration

Set the following environment variables:

```bash
DATABASE_URL=postgresql://sv_sdk_user:password@localhost:5432/sv_sdk
DB_POOL_SIZE=20  # Optional, defaults to 20
```

## Usage

### Database Client

```typescript
import { db, sql } from '@big0290/db-config'
import { users } from '@big0290/db-config/schemas/auth'
import { eq } from 'drizzle-orm'

// Query users
const allUsers = await db.select().from(users)

// Insert user
const newUser = await db
  .insert(users)
  .values({
    id: 'user-123',
    email: 'user@example.com',
    name: 'John Doe',
  })
  .returning()

// Update user
await db.update(users).set({ name: 'Jane Doe' }).where(eq(users.id, 'user-123'))

// Delete user
await db.delete(users).where(eq(users.id, 'user-123'))
```

### Health Checks

```typescript
import { checkConnection, checkSchemas } from '@big0290/db-config'

// Check database connection
const health = await checkConnection()
// { healthy: true, latency: 15 }

// Check if all schemas exist
const schemas = await checkSchemas()
// { exists: true, schemas: ['auth', 'email', 'audit', 'permissions'], missing: [] }
```

### Schemas and Types

```typescript
import type { User, NewUser } from '@big0290/db-config'

// Use generated types
const user: User = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  emailVerified: false,
  role: 'user',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // ...
}

// For inserts
const newUser: NewUser = {
  id: 'user-456',
  email: 'newuser@example.com',
  name: 'New User',
}
```

### Validation with Zod

```typescript
import { insertUserSchema, selectUserSchema } from '@big0290/db-config'

// Validate insert data
const result = insertUserSchema.safeParse({
  id: 'user-123',
  email: 'invalid-email', // Will fail validation
  name: 'John Doe',
})

if (!result.success) {
  console.error(result.error.errors)
}
```

## Scripts

### Generate Migrations

```bash
# Generate migration files from schema changes
pnpm db:generate
```

### Run Migrations

```bash
# Apply migrations to database
pnpm db:migrate
```

### Seed Database

```bash
# Seed database with initial data
pnpm db:seed
```

Seeds:

- 4 default roles (super_admin, admin, manager, user)
- 1 admin user (admin@example.com)
- 3 email templates (verification, password reset, notification)

### Drizzle Studio

```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Backup & Restore

```bash
# Create backup
pnpm db:backup

# Restore from backup
pnpm db:restore <backup-file>
```

## Schemas

### Auth Schema

**Tables**: users, sessions, accounts, verifications

BetterAuth-compatible schema with custom extensions.

```typescript
import { users, sessions } from '@big0290/db-config/schemas/auth'
```

### Email Schema

**Tables**: email_templates, email_sends, email_webhooks, email_preferences

Manages email templates (MJML), sending history, webhooks, and user preferences.

```typescript
import { emailTemplates, emailSends } from '@big0290/db-config/schemas/email'
```

### Audit Schema

**Tables**: audit_logs

Append-only audit log with indexing for fast queries. Supports PII masking and tamper detection.

```typescript
import { auditLogs } from '@big0290/db-config/schemas/audit'
```

### Permissions Schema

**Tables**: roles, user_roles, permission_cache

RBAC system with role management and permission caching.

```typescript
import { roles, userRoles, permissionCache } from '@big0290/db-config/schemas/permissions'
```

## Indexes

Optimized indexes for common queries:

**Auth**:

- `users.email` (unique index)
- `sessions.userId` and `sessions.expiresAt`

**Email**:

- `email_sends.status` and `email_sends.createdAt`
- `email_templates.name` (unique index)

**Audit**:

- `audit_logs.eventType` and `audit_logs.createdAt`
- `audit_logs.userId` and `audit_logs.createdAt`

**Permissions**:

- `user_roles.userId` and `user_roles.roleId`
- `permission_cache.userId` and `permission_cache.expiresAt`

## Performance

**Connection Pooling**:

- Default: 20 connections
- Idle timeout: 20 seconds
- Connect timeout: 10 seconds

**Query Performance Targets**:

- Indexed lookups: < 50ms
- Bulk inserts: > 1000 records/second
- Pool utilization: > 80%

## Migration Strategy

1. **Development**: Use `pnpm db:push` for quick iterations
2. **Staging**: Generate migrations with `pnpm db:generate` and apply with `pnpm db:migrate`
3. **Production**: Apply migrations with proper rollback plan

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migration Conflicts

```bash
# Check migration status
pnpm db:check

# Reset and regenerate
rm -rf migrations/*
pnpm db:generate
```

### Schema Not Found

Ensure schemas are created by running the init script:

```bash
docker-compose up -d postgres
```

The `scripts/init-db.sql` creates all schemas automatically.

## Testing

```bash
# Run tests
pnpm test

# With coverage
pnpm test:coverage
```

## Documentation

- [Database Decision](../../DATABASE_DECISION.md) - Why single DB with schemas
- [Schema Diagrams](./docs/database.md) - Visual schema documentation

## License

MIT
