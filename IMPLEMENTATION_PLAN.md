# Svelte 5 SDK Platform Implementation Plan (Enhanced)

## Architecture Decisions Applied

- **Structure**: All packages in `packages/`, apps in `apps/`
- **Naming**: `@sv-sdk/*` scope for all packages
- **Database**: Single PostgreSQL database with separate schemas (auth, email, audit, permissions) - _Changed from 3 DBs for atomic transactions_
- **Auth**: BetterAuth with Drizzle adapter
- **UI**: Tailwind CSS with accessibility & i18n from start
- **Email**: Provider abstraction layer with Brevo as primary
- **Permissions**: Database-driven RBAC with caching layer
- **Testing**: Unit, integration, and E2E tests throughout all phases
- **Security**: Cross-cutting security strategy integrated from Phase 2
- **Validation**: Zod for all runtime validation and type generation

---

## Quick Start (For First-Time Setup)

```bash
# 1. Clone and install
git clone <repo>
cd sv-sdk
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start services (PostgreSQL + Redis)
docker-compose up -d

# 4. Run migrations and seed data
pnpm db:migrate
pnpm db:seed

# 5. Start development servers
pnpm dev

# 6. Access admin panel
# http://localhost:5173
# Default credentials: admin@example.com / Admin123!
```

**See**: [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for daily development guide and [PHASE_DEPENDENCIES.md](./PHASE_DEPENDENCIES.md) for implementation order.

---

## Phase 0: Complete Monorepo Bootstrap

**Current State**: Basic structure exists (`apps/admin/`, `packages/sdk/`, root package.json)

**Tasks**:

1. Add `turbo.json` with pipelines (build, dev, lint, test, type-check)
2. Create `docker-compose.yml` with PostgreSQL (single database, 4 schemas: auth, email, audit, permissions) + Redis
3. Create `docker-compose.dev.yml` for local development with test database
4. Create root `.env.example` with all configuration placeholders (see detailed list below)
5. Verify pnpm workspace configuration
6. Create `.gitignore` and `.dockerignore`
7. Setup TypeScript path aliases for monorepo packages
8. Create `scripts/dev-setup.sh` for automated local environment setup
9. Add package versioning strategy documentation
10. Update root `README.md` with comprehensive quick start

**New Files**:

- `/turbo.json`
- `/docker-compose.yml` (with init script for PostgreSQL schemas)
- `/docker-compose.dev.yml`
- `/.env.example`
- `/.gitignore`
- `/.dockerignore`
- `/scripts/dev-setup.sh`
- `/scripts/init-db.sql` (PostgreSQL schema initialization)
- `/VERSIONING.md`
- `/DATABASE_DECISION.md` (rationale for single DB with schemas)
- `/DEVELOPMENT_WORKFLOW.md` (daily development guide)
- `/PHASE_DEPENDENCIES.md` (visual phase dependencies)

**Docker Compose Configuration**:

```yaml
# docker-compose.yml structure:
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk
      POSTGRES_USER: sv_sdk_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U sv_sdk_user -d sv_sdk']
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk_test
      POSTGRES_USER: sv_sdk_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5433:5432'

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Schema Initialization Script** (`scripts/init-db.sql`):

```sql
-- Create schemas for logical separation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS email;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS permissions;

-- Grant permissions
GRANT ALL ON SCHEMA auth TO sv_sdk_user;
GRANT ALL ON SCHEMA email TO sv_sdk_user;
GRANT ALL ON SCHEMA audit TO sv_sdk_user;
GRANT ALL ON SCHEMA permissions TO sv_sdk_user;
```

**Environment Variables** (`.env.example`):

```bash
# Database Configuration (Single database, multiple schemas)
DATABASE_URL=postgresql://sv_sdk_user:password@localhost:5432/sv_sdk
DATABASE_URL_TEST=postgresql://sv_sdk_user:password@localhost:5433/sv_sdk_test
DB_PASSWORD=your_secure_password_here
DB_POOL_SIZE=20

# Redis Configuration
REDIS_URL=redis://:password@localhost:6379
REDIS_PASSWORD=your_redis_password_here

# Auth Configuration (BetterAuth)
BETTER_AUTH_SECRET=your_secret_key_min_32_chars_here
BETTER_AUTH_URL=http://localhost:5173
SESSION_MAX_AGE=604800 # 7 days in seconds
ACCESS_TOKEN_EXPIRES=900 # 15 minutes in seconds

# Email Provider Configuration
EMAIL_PROVIDER=mock # Options: brevo, ses, mock
# Brevo
BREVO_API_KEY=your_brevo_api_key_here
BREVO_WEBHOOK_SECRET=your_webhook_secret_here
# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Application Configuration
NODE_ENV=development # Options: development, production, test
LOG_LEVEL=debug # Options: debug, info, warn, error
CORS_ORIGIN=http://localhost:5173

# Security Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000 # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_EMAIL_QUEUE=true
ENABLE_AUDIT_LOGGING=true
ENABLE_REDIS_CACHE=true

# Performance & Monitoring
SENTRY_DSN=your_sentry_dsn_here (optional)
ENABLE_METRICS=false
```

**Troubleshooting Common Issues**:

- **Port conflicts**: Check if ports 5432, 5433, or 6379 are in use
- **Database connection**: Verify PostgreSQL container is running with `docker-compose ps`
- **Redis connection**: Test with `redis-cli -h localhost -p 6379 ping`
- **Build errors**: Clear `node_modules` and run `pnpm install --force`
- **Migration errors**: Reset database with `docker-compose down -v && docker-compose up -d`

---

## Phase 0.5: Shared Configuration & Types

**Package**: `packages/shared`

**Implementation**:

1. Create custom error classes hierarchy:
   - `SDKError` (base)
   - `ValidationError`, `AuthenticationError`, `PermissionError`, `DatabaseError`
   - `ExternalServiceError`, `RateLimitError`

2. Setup structured logging utilities:
   - Log levels (debug, info, warn, error)
   - Contextual logging with correlation IDs
   - Log formatting for development and production

3. Create shared type utilities:
   - Result type: `Result<T, E = Error>`
   - Pagination types
   - Filter types

4. Setup shared constants:
   - HTTP status codes
   - Event type constants
   - Permission constants (placeholder)

5. Basic unit tests for error handling

**Export**: Error classes, logging utilities, common types, constants

**Why**: Foundational layer prevents inconsistency across packages

---

## Phase 0.75: Testing Infrastructure

**Purpose**: Setup testing infrastructure before implementation begins

**Implementation**:

1. **Root Vitest configuration**:
   - Create `vitest.config.ts` at root
   - Shared test configuration for all packages
   - Coverage configuration (80%+ target)
   - Test environment setup

2. **Test database utilities**:
   - `test-db-setup.ts` - Initialize test database
   - `test-db-teardown.ts` - Clean up after tests
   - Database transaction rollback for isolation
   - Schema migration for test environment

3. **Mock data factories**:
   - User factory with realistic data
   - Email factory
   - Audit log factory
   - Role and permission factories

4. **Test environment configuration**:
   - `.env.test` template
   - Test-specific connection strings
   - Mock service configuration

5. **CI-friendly test commands**:
   - `pnpm test` - Run all tests
   - `pnpm test:unit` - Unit tests only
   - `pnpm test:integration` - Integration tests
   - `pnpm test:coverage` - Generate coverage report
   - `pnpm test:ci` - CI-optimized test run

**Files**:

- `/vitest.config.ts`
- `/vitest.workspace.ts` (for monorepo)
- `/test/setup.ts`
- `/test/utils/db-factory.ts`
- `/test/utils/mock-factories.ts`
- `/test/utils/test-helpers.ts`
- `/.env.test`

**Export**: Test utilities, mock factories, database helpers

**Why**: Enables test-driven development from Phase 1 onwards

---

## Phase 1: Database Configuration (Drizzle ORM)

**Package**: `packages/db-config`

**Implementation**:

1. **Install dependencies**:

   ```bash
   pnpm add drizzle-orm drizzle-kit drizzle-zod pg postgres zod
   pnpm add -D @types/pg
   ```

2. **Create schema files for each domain** (single database, multiple PostgreSQL schemas):
   - `src/schemas/auth.schema.ts` - users, sessions (BetterAuth required tables + custom fields)
   - `src/schemas/email.schema.ts` - email_templates, email_sends, email_webhooks
   - `src/schemas/audit.schema.ts` - audit_logs (append-only, indexed)
   - `src/schemas/permissions.schema.ts` - roles, user_roles, permissions, permission_cache

3. **Create database client with connection pooling**:

   ```typescript
   // src/client.ts
   import { drizzle } from 'drizzle-orm/postgres-js'
   import postgres from 'postgres'
   import * as authSchema from './schemas/auth.schema'
   import * as emailSchema from './schemas/email.schema'
   import * as auditSchema from './schemas/audit.schema'
   import * as permissionsSchema from './schemas/permissions.schema'

   const connectionString = process.env.DATABASE_URL!
   const sql = postgres(connectionString, {
     max: 20, // Connection pool size
     idle_timeout: 20,
     connect_timeout: 10,
   })

   export const db = drizzle(sql, {
     schema: {
       ...authSchema,
       ...emailSchema,
       ...auditSchema,
       ...permissionsSchema,
     },
   })

   // Health check utility
   export async function checkConnection() {
     try {
       await sql`SELECT 1`
       return { healthy: true }
     } catch (error) {
       return { healthy: false, error }
     }
   }
   ```

4. **Setup migration system**:

   **Drizzle config** (`drizzle.config.ts`):

   ```typescript
   import { defineConfig } from 'drizzle-kit'

   export default defineConfig({
     schema: './src/schemas/*.schema.ts',
     out: './migrations',
     dialect: 'postgresql',
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
     schemaFilter: ['auth', 'email', 'audit', 'permissions'],
   })
   ```

   **Migration orchestration script** (`scripts/migrate.ts`):

   ```typescript
   // Handles migration ordering, rollback, version compatibility
   import { migrate } from 'drizzle-orm/postgres-js/migrator'
   import { db, sql } from '../src/client'

   async function runMigrations() {
     console.log('🔄 Running migrations...')

     // Pre-flight checks
     await checkConnection()
     await checkPermissions()

     // Apply migrations in order
     await migrate(db, { migrationsFolder: './migrations' })

     console.log('✅ Migrations completed')
     await sql.end()
   }

   async function rollback(steps = 1) {
     // Rollback logic with transaction safety
   }
   ```

5. **Create seed data scripts** (`scripts/seed.ts`):
   - Initial admin user with hashed password
   - Default roles (super_admin, admin, manager, user) with permission sets
   - Email template seeds (verification, password_reset, invite, notification, marketing)
   - Migration status tracking

6. **Generate Zod schemas from Drizzle** using `drizzle-zod`:

   ```typescript
   // src/schemas/auth.schema.ts
   import { pgTable, text, uuid, timestamp, pgSchema } from 'drizzle-orm/pg-core'
   import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

   export const authSchema = pgSchema('auth')

   export const users = authSchema.table('users', {
     id: uuid('id').defaultRandom().primaryKey(),
     email: text('email').notNull().unique(),
     name: text('name'),
     // ... more fields
   })

   // Auto-generated Zod schemas
   export const insertUserSchema = createInsertSchema(users)
   export const selectUserSchema = createSelectSchema(users)
   ```

7. **Add backup/restore helper scripts** (`scripts/backup.ts`, `scripts/restore.ts`):
   - pg_dump wrapper for automated backups
   - Restoration procedures
   - Backup verification

8. **Database documentation** (`docs/database.md`):
   - Mermaid schema diagrams for each domain
   - Relationship diagrams
   - Indexing strategy explained
   - Performance considerations

**Critical Details**:

- **Single database connection**: Use `DATABASE_URL` pointing to `sv_sdk` database
- **Schema-aware queries**: Reference tables as `auth.users`, `email.templates`, etc.
- **Connection pooling**: Max 20 connections, configure for production scaling
- **Indexes**: Add indexes on:
  - `audit.audit_logs`: (user_id, created_at), (event_type, created_at)
  - `auth.users`: (email)
  - `email.email_sends`: (status, created_at)
  - `permissions.user_roles`: (user_id, role_id)

**Performance Targets**:

- Query latency: < 50ms for indexed lookups
- Bulk insert throughput: > 1000 records/second
- Connection pool efficiency: > 80% utilization

**Export**: `db` client, all schemas, Zod validators (insert/select/update), migration utilities, health check functions

---

## Phase 1.5: Type Safety & Validation Layer

**Package**: `packages/validators`

**Implementation**:

1. **Import base Zod schemas from** `@sv-sdk/db-config` and extend for DTOs:

   ```typescript
   // Import generated base schemas
   import { insertUserSchema, selectUserSchema } from '@sv-sdk/db-config'

   // Extend for specific DTOs
   export const loginRequestSchema = selectUserSchema
     .pick({
       email: true,
     })
     .extend({
       password: z.string().min(12),
     })

   export const signupRequestSchema = insertUserSchema
     .omit({
       id: true,
       createdAt: true,
     })
     .extend({
       password: z.string().min(12).regex(/[A-Z]/).regex(/[0-9]/),
       confirmPassword: z.string(),
     })
     .refine((data) => data.password === data.confirmPassword, {
       message: "Passwords don't match",
       path: ['confirmPassword'],
     })

   export const updateUserRequestSchema = insertUserSchema.partial().omit({
     id: true,
     email: true, // Prevent email updates via API
   })
   ```

2. **Create domain-specific DTOs**:
   - Auth DTOs: `LoginRequest`, `SignupRequest`, `UpdateUserRequest`, `PasswordResetRequest`
   - Email DTOs: `SendEmailRequest`, `TemplateRequest`, `TemplateUpdateRequest`
   - Audit DTOs: `LogQueryRequest`, `AuditExportRequest`
   - Permissions DTOs: `RoleRequest`, `PermissionRequest`, `AssignRoleRequest`

3. **Build validation utilities**:

   ```typescript
   export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): Result<T> {
     const result = schema.safeParse(data)
     if (!result.success) {
       return {
         success: false,
         error: new ValidationError(formatZodErrors(result.error)),
       }
     }
     return { success: true, data: result.data }
   }

   export function sanitizeInput(input: string): string {
     // XSS prevention using DOMPurify or similar
   }

   export const emailValidator = z.string().email().toLowerCase()

   export function validatePasswordStrength(password: string): {
     valid: boolean
     score: number
     feedback: string[]
   } {
     // Implement password strength checking
     // Consider integration with zxcvbn library
   }
   ```

4. **Create type guards and assertion functions**:

   ```typescript
   export function isValidUser(data: unknown): data is User {
     return selectUserSchema.safeParse(data).success
   }

   export function assertValidEmail(email: unknown): asserts email is string {
     if (!emailValidator.safeParse(email).success) {
       throw new ValidationError('Invalid email address')
     }
   }
   ```

5. **Setup API response types**:

   ```typescript
   export type ApiResponse<T> =
     | {
         success: true
         data: T
         meta?: {
           requestId: string
           timestamp: string
         }
       }
     | {
         success: false
         error: {
           code: string
           message: string
           details?: unknown
         }
       }

   export type PaginatedResponse<T> = {
     data: T[]
     pagination: {
       page: number
       pageSize: number
       totalPages: number
       totalCount: number
     }
   }

   export type ErrorResponse = {
     code: string // e.g., 'VALIDATION_ERROR', 'AUTH_FAILED'
     message: string
     field?: string // For field-specific errors
     details?: Record<string, unknown>
   }
   ```

6. **Export all validators and types with proper documentation**

**Integration**:

- Base schemas generated from Drizzle (`@sv-sdk/db-config`)
- Extended DTOs for API requests/responses
- Used by all packages for runtime validation

**Why**: Ensures type safety from database to API with single source of truth

---

## Phase 1.75: Redis & Cache Configuration

**Package**: `packages/cache`

**Purpose**: Centralized Redis client and caching utilities for session storage, rate limiting, and permission caching

**Implementation**:

1. **Install dependencies**:

   ```bash
   pnpm add ioredis
   pnpm add -D @types/ioredis
   ```

2. **Create Redis client with connection pooling**:

   ```typescript
   // src/client.ts
   import Redis from 'ioredis'

   const redisClient = new Redis(process.env.REDIS_URL!, {
     maxRetriesPerRequest: 3,
     retryStrategy: (times) => {
       const delay = Math.min(times * 50, 2000)
       return delay
     },
     reconnectOnError: (err) => {
       const targetError = 'READONLY'
       if (err.message.includes(targetError)) {
         return true
       }
       return false
     },
   })

   redisClient.on('error', (err) => {
     console.error('Redis connection error:', err)
   })

   export { redisClient as redis }
   ```

3. **Build cache utilities**:

   ```typescript
   // src/cache-utils.ts
   export async function cacheGet<T>(key: string): Promise<T | null> {
     const data = await redis.get(key)
     return data ? JSON.parse(data) : null
   }

   export async function cacheSet<T>(
     key: string,
     value: T,
     ttl?: number // TTL in seconds
   ): Promise<void> {
     const serialized = JSON.stringify(value)
     if (ttl) {
       await redis.setex(key, ttl, serialized)
     } else {
       await redis.set(key, serialized)
     }
   }

   export async function cacheDelete(key: string): Promise<void> {
     await redis.del(key)
   }

   export async function cacheDeletePattern(pattern: string): Promise<void> {
     const keys = await redis.keys(pattern)
     if (keys.length > 0) {
       await redis.del(...keys)
     }
   }
   ```

4. **BullMQ queue setup utilities**:

   ```typescript
   // src/queue.ts
   import { Queue, Worker, QueueOptions } from 'bullmq'

   export function createQueue<T = any>(name: string, options?: Partial<QueueOptions>): Queue<T> {
     return new Queue<T>(name, {
       connection: {
         host: process.env.REDIS_HOST,
         port: parseInt(process.env.REDIS_PORT || '6379'),
         password: process.env.REDIS_PASSWORD,
       },
       defaultJobOptions: {
         attempts: 3,
         backoff: {
           type: 'exponential',
           delay: 1000,
         },
         removeOnComplete: 100, // Keep last 100 completed jobs
         removeOnFail: 500, // Keep last 500 failed jobs
       },
       ...options,
     })
   }

   export { Worker, QueueEvents } from 'bullmq'
   ```

5. **Health check for Redis connection**:

   ```typescript
   // src/health.ts
   export async function checkRedisHealth(): Promise<{
     healthy: boolean
     latency?: number
     error?: string
   }> {
     try {
       const start = Date.now()
       await redis.ping()
       const latency = Date.now() - start
       return { healthy: true, latency }
     } catch (error) {
       return {
         healthy: false,
         error: error instanceof Error ? error.message : 'Unknown error',
       }
     }
   }
   ```

6. **Configuration and constants**:

   ```typescript
   // src/config.ts
   export const CACHE_TTL = {
     SHORT: 60, // 1 minute
     MEDIUM: 300, // 5 minutes
     LONG: 3600, // 1 hour
     DAY: 86400, // 24 hours
   }

   export const CACHE_KEYS = {
     USER: (id: string) => `user:${id}`,
     PERMISSIONS: (userId: string) => `permissions:${userId}`,
     SESSION: (sessionId: string) => `session:${sessionId}`,
     RATE_LIMIT: (identifier: string) => `rate_limit:${identifier}`,
   }
   ```

7. **Performance targets**:
   - Cache hit latency: < 5ms
   - Cache miss fallback: < 50ms (with DB query)
   - Target hit rate: > 80% for permissions and user data

8. **Unit tests**:
   - Connection handling and retries
   - Cache get/set/delete operations
   - TTL expiration
   - Queue creation and health checks

**Export**: Redis client, cache utilities, queue factory, health check, cache key constants

**Integration**: Used by `@sv-sdk/security` (rate limiting), `@sv-sdk/auth` (sessions), `@sv-sdk/permissions` (permission caching), `@sv-sdk/email` (BullMQ queues)

---

## Phase 2: Core SDK & Plugin System

**Package**: `packages/core`

**Implementation**:

1. Create `sdk-context.ts` with typed interface:
   - DB client reference
   - Logger instance
   - Event bus reference
   - Configuration object
   - Cache reference (Redis)

2. Build robust event bus in `event-bus.ts`:
   - Type-safe event emission and subscription
   - Error handling for listeners
   - Async event handling
   - Event priority system

3. Implement enhanced plugin system:

   ```typescript
   interface Plugin {
     name: string
     version: string
     dependencies?: string[] // Other required plugins
     config?: PluginConfig
     lifecycle: {
       beforeInit?: (ctx: SDKContext) => Promise<void>
       init: (ctx: SDKContext) => Promise<void>
       afterInit?: (ctx: SDKContext) => Promise<void>
       onDestroy?: () => Promise<void>
     }
   }
   ```

4. Implement `createSDK(plugins, config)` with:
   - Plugin dependency resolution
   - Plugin ordering by priority
   - Error isolation per plugin
   - Configuration validation

5. Add structured logging implementation:
   - Integration with popular loggers (winston, pino)
   - Development vs production formatting
   - Log sanitization (remove sensitive data)

6. Create health check system:
   - `/health` endpoint data provider
   - Database connectivity check
   - Redis connectivity check
   - Plugin health status

7. Implement graceful shutdown handler

8. Comprehensive unit tests:
   - Plugin loading and ordering
   - Dependency resolution
   - Error isolation
   - Event bus functionality

**Export**: `createSDK`, `SDKContext` type, `EventBus` class, `Plugin` interface, health check utilities

---

## Phase 2.5: Security Foundation

**Package**: `packages/security`

**Implementation**:

1. Rate limiting utilities:
   - Redis-backed rate limiter
   - Configurable windows and limits
   - Per-user and per-IP limiting
   - Rate limit headers

2. CSRF protection:
   - Token generation and validation
   - SameSite cookie configuration
   - Double-submit cookie pattern

3. Input sanitization:
   - XSS prevention utilities
   - SQL injection prevention guidelines
   - Path traversal prevention

4. Security headers configuration:
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)
   - X-Frame-Options
   - X-Content-Type-Options

5. Secrets management utilities:
   - Environment variable validation
   - Secret redaction in logs
   - Encryption utilities (for sensitive DB fields)

6. Audit trail for security events:
   - Failed login attempts
   - Permission denials
   - Rate limit hits
   - Suspicious activities

7. Security checklist documentation

8. Unit tests for all security utilities

**Export**: Rate limiter, CSRF utilities, sanitizers, security middleware, security headers config

---

## Phase 3: Authentication Package

**Package**: `packages/auth`

**Implementation**:

1. **Install BetterAuth with Drizzle adapter**:

   ```bash
   pnpm add better-auth @better-auth/drizzle
   pnpm add argon2 # For password hashing
   ```

2. **Configure BetterAuth with Drizzle**:

   ```typescript
   // src/auth-config.ts
   import { betterAuth } from 'better-auth'
   import { drizzleAdapter } from '@better-auth/drizzle'
   import { db } from '@sv-sdk/db-config'
   import { users, sessions, accounts, verifications } from '@sv-sdk/db-config/schemas/auth.schema'

   export const auth = betterAuth({
     database: drizzleAdapter(db, {
       provider: 'pg',
       schema: {
         user: users,
         session: sessions,
         account: accounts,
         verification: verifications,
       },
     }),

     // Session configuration
     session: {
       strategy: 'database', // Store sessions in PostgreSQL
       expiresIn: 60 * 60 * 24 * 7, // 7 days
       updateAge: 60 * 60 * 24, // Update session every 24 hours
     },

     // Cookie configuration
     cookie: {
       name: 'sv-sdk-session',
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 60 * 60 * 24 * 7, // 7 days
     },

     // Email verification
     emailVerification: {
       enabled: true,
       sendVerificationEmail: async ({ user, url }) => {
         // Integrate with @sv-sdk/email package
         await sendVerificationEmail(user.email, url)
       },
     },

     // Password reset
     resetPassword: {
       enabled: true,
       sendResetEmail: async ({ user, url }) => {
         await sendPasswordResetEmail(user.email, url)
       },
     },
   })

   export type Session = typeof auth.$Infer.Session
   export type User = typeof auth.$Infer.User
   ```

3. **Merge BetterAuth schema with custom user fields**:

   ```typescript
   // @sv-sdk/db-config/schemas/auth.schema.ts
   import { pgTable, text, timestamp, boolean, pgSchema } from 'drizzle-orm/pg-core'

   export const authSchema = pgSchema('auth')

   // BetterAuth required tables with custom extensions
   export const users = authSchema.table('users', {
     id: text('id').primaryKey(), // BetterAuth uses text IDs
     email: text('email').notNull().unique(),
     emailVerified: boolean('email_verified').default(false),
     name: text('name'),
     image: text('image'),

     // Custom fields
     role: text('role').default('user'), // For basic role
     isActive: boolean('is_active').default(true),
     lastLoginAt: timestamp('last_login_at'),

     createdAt: timestamp('created_at').defaultNow(),
     updatedAt: timestamp('updated_at').defaultNow(),
   })

   export const sessions = authSchema.table('sessions', {
     id: text('id').primaryKey(),
     userId: text('user_id')
       .notNull()
       .references(() => users.id, { onDelete: 'cascade' }),
     expiresAt: timestamp('expires_at').notNull(),
     ipAddress: text('ip_address'),
     userAgent: text('user_agent'),
     createdAt: timestamp('created_at').defaultNow(),
   })

   export const accounts = authSchema.table('accounts', {
     id: text('id').primaryKey(),
     userId: text('user_id')
       .notNull()
       .references(() => users.id, { onDelete: 'cascade' }),
     provider: text('provider').notNull(), // 'email', 'google', 'github', etc.
     providerAccountId: text('provider_account_id').notNull(),
     accessToken: text('access_token'),
     refreshToken: text('refresh_token'),
     expiresAt: timestamp('expires_at'),
     createdAt: timestamp('created_at').defaultNow(),
   })

   export const verifications = authSchema.table('verifications', {
     id: text('id').primaryKey(),
     identifier: text('identifier').notNull(), // Email or phone
     value: text('value').notNull(), // Token
     expiresAt: timestamp('expires_at').notNull(),
     createdAt: timestamp('created_at').defaultNow(),
   })
   ```

4. **Implement user service functions**:

   ```typescript
   // src/user-service.ts
   import { db } from '@sv-sdk/db-config'
   import { users } from '@sv-sdk/db-config/schemas/auth.schema'
   import { cacheGet, cacheSet, cacheDelete, CACHE_TTL } from '@sv-sdk/cache'
   import { eq, like, and } from 'drizzle-orm'

   export async function getUsers(filters, pagination) {
     // With caching and pagination
   }

   export async function createUser(data) {
     // With password hashing via BetterAuth
     const user = await auth.api.signUp({
       email: data.email,
       password: data.password,
       name: data.name,
     })

     // Emit audit event
     await logAudit('user.created', { userId: user.id, email: user.email })

     return user
   }

   export async function updateUser(id, data) {
     // Invalidate cache on update
     await cacheDelete(`user:${id}`)
   }

   export async function deleteUser(id) {
     // Soft delete
     await db.update(users).set({ isActive: false }).where(eq(users.id, id))
     await cacheDelete(`user:${id}`)
     await logAudit('user.deleted', { userId: id })
   }

   export async function getUserById(id, useCache = true) {
     if (useCache) {
       const cached = await cacheGet(`user:${id}`)
       if (cached) return cached
     }

     const user = await db.select().from(users).where(eq(users.id, id)).limit(1)
     if (user[0]) {
       await cacheSet(`user:${id}`, user[0], CACHE_TTL.MEDIUM)
     }
     return user[0]
   }
   ```

5. **Add authentication features with rate limiting**:
   - Login: 5 attempts per 15 minutes (using `@sv-sdk/security` rate limiter)
   - Password reset: 3 attempts per hour
   - Signup: 3 attempts per hour per IP
   - Email verification flow (integrated with `@sv-sdk/email`)
   - Password reset flow
   - Account linking (email + OAuth providers via BetterAuth)
   - Session management (list, revoke)

6. **Add password policy enforcement**:

   ```typescript
   // src/password-policy.ts
   import { validatePasswordStrength } from '@sv-sdk/validators'

   export async function enforcePasswordPolicy(password: string) {
     // Minimum length: 12 characters
     // Complexity: uppercase, lowercase, number, special char
     const strength = validatePasswordStrength(password)

     if (!strength.valid) {
       throw new ValidationError('Password does not meet requirements', {
         feedback: strength.feedback,
       })
     }

     // Optional: Check against HaveIBeenPwned API
     const breached = await checkPasswordBreach(password)
     if (breached) {
       throw new ValidationError('Password has been found in a data breach')
     }
   }
   ```

7. **Emit audit events** (using `@sv-sdk/audit`):
   - User login, logout
   - Failed login attempts
   - Password changes
   - User CRUD operations
   - Session revocations

8. **Create SvelteKit integration guide** (`docs/hooks-sample.md`):

   ```typescript
   // Example hooks.server.ts
   import { auth } from '@sv-sdk/auth'
   import type { Handle } from '@sveltejs/kit'

   export const handle: Handle = async ({ event, resolve }) => {
     const session = await auth.api.getSession({
       headers: event.request.headers,
     })

     event.locals.session = session.session
     event.locals.user = session.user

     return resolve(event)
   }
   ```

9. **MFA consideration documentation** (future feature in `docs/mfa.md`)

10. **Comprehensive tests**:
    - User CRUD operations
    - Authentication flows (login, signup, logout)
    - Rate limiting enforcement
    - Session management (creation, validation, revocation)
    - Password policy enforcement
    - Email verification workflow
    - Cache invalidation on updates

**Critical Integration Points**:

- BetterAuth provides user/session tables → stored in `auth` schema
- Sessions cached in Redis for performance (via `@sv-sdk/cache`)
- All auth actions logged to audit (via `@sv-sdk/audit`)
- Email verification/reset uses `@sv-sdk/email` package
- Rate limiting via `@sv-sdk/security` package

**Export**: BetterAuth instance, user service functions, typed `User` and `Session` interfaces, auth middleware, SvelteKit hooks helper

---

## Phase 4: Audit Logging Package

**Package**: `packages/audit`

**Implementation**:

1. Create `logAudit(eventType, metadata, options)` function:
   - Writes to `audit_logs` table (append-only)
   - Automatic PII masking based on configuration
   - Batching support for high-volume logging
   - Async/non-blocking writes

2. Implement PII handling:
   - Configurable PII fields (email, phone, SSN, etc.)
   - Auto-detection and masking
   - Encryption for sensitive audit data
   - GDPR compliance utilities

3. Implement `fetchAuditLogs(filters, pagination)`:
   - Filter by event type, user, date range
   - Full-text search on metadata
   - Export functionality (CSV, JSON)
   - Performance optimization with proper indexes

4. Add retention policy system:
   - Configurable retention periods
   - Automated cleanup job
   - Archive to cold storage before deletion
   - Legal hold support

5. Log integrity features:
   - Cryptographic hash chain for tamper detection
   - Immutable log entries (database constraints)
   - Log verification utilities

6. Performance optimizations:
   - Write buffering
   - Bulk inserts
   - Partitioning strategy for large tables
   - Read replicas consideration

7. Compliance documentation:
   - GDPR compliance notes
   - SOC2 considerations
   - Data retention requirements

8. Comprehensive tests:
   - Log writing and querying
   - PII masking
   - Retention policies
   - Performance tests

**Schema**:

```typescript
{
  id: uuid,
  event_type: string,
  user_id: uuid?,
  ip_address: string,
  user_agent: string,
  metadata: jsonb,
  pii_masked: boolean,
  hash: string, // For integrity
  created_at: timestamp,
  partition_key: date // For partitioning
}
```

**Export**: Audit functions, PII utilities, retention utilities

---

## Phase 5: Email Package (Templates + Queue + Providers)

**Package**: `packages/email`

**Implementation**:

1. **Install dependencies**:

   ```bash
   pnpm add mjml handlebars bullmq
   pnpm add @getbrevo/brevo @aws-sdk/client-ses # Providers
   pnpm add -D @types/mjml @types/handlebars
   ```

2. **Create provider abstraction**:

   ```typescript
   // src/providers/types.ts
   interface EmailProvider {
     send(email: EmailMessage): Promise<Result<EmailResult>>
     verifyWebhook(payload: unknown): WebhookEvent
     getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
   }

   type EmailMessage = {
     to: string
     from: string
     subject: string
     html: string
     text?: string
     attachments?: Attachment[]
   }

   type EmailResult = {
     messageId: string
     provider: string
     timestamp: Date
   }
   ```

   **Implement Brevo provider** (`providers/brevo.ts`):

   ```typescript
   import * as brevo from '@getbrevo/brevo'
   import crypto from 'crypto'

   export class BrevoProvider implements EmailProvider {
     private client: brevo.TransactionalEmailsApi

     constructor(apiKey: string) {
       const instance = brevo.ApiClient.instance
       const auth = instance.authentications['api-key']
       auth.apiKey = apiKey
       this.client = new brevo.TransactionalEmailsApi()
     }

     async send(email: EmailMessage): Promise<Result<EmailResult>> {
       try {
         const sendSmtpEmail = new brevo.SendSmtpEmail()
         sendSmtpEmail.to = [{ email: email.to }]
         sendSmtpEmail.sender = { email: email.from }
         sendSmtpEmail.subject = email.subject
         sendSmtpEmail.htmlContent = email.html
         sendSmtpEmail.textContent = email.text

         const response = await this.client.sendTransacEmail(sendSmtpEmail)

         // Track cost
         await trackEmailCost('brevo', 1)

         return {
           success: true,
           data: {
             messageId: response.messageId,
             provider: 'brevo',
             timestamp: new Date(),
           },
         }
       } catch (error) {
         return {
           success: false,
           error: new ExternalServiceError('Brevo send failed', error),
         }
       }
     }

     verifyWebhook(payload: unknown, signature: string): WebhookEvent {
       // Verify signature using webhook secret
       const secret = process.env.BREVO_WEBHOOK_SECRET!
       const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')

       if (computed !== signature) {
         throw new Error('Invalid webhook signature')
       }

       // Parse and return webhook event
       return parseBrevoWebhook(payload)
     }

     async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
       // Query Brevo API for message status
     }
   }
   ```

   **Implement AWS SES provider** (`providers/ses.ts`):

   ```typescript
   import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-ses'

   export class SESProvider implements EmailProvider {
     private client: SESv2Client

     constructor() {
       this.client = new SESv2Client({
         region: process.env.AWS_REGION,
         credentials: {
           accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
         },
       })
     }

     async send(email: EmailMessage): Promise<Result<EmailResult>> {
       const command = new SendEmailCommand({
         FromEmailAddress: email.from,
         Destination: { ToAddresses: [email.to] },
         Content: {
           Simple: {
             Subject: { Data: email.subject },
             Body: {
               Html: { Data: email.html },
               Text: { Data: email.text },
             },
           },
         },
       })

       try {
         const response = await this.client.send(command)
         await trackEmailCost('ses', 0.0001) // $0.10 per 1000 emails

         return {
           success: true,
           data: {
             messageId: response.MessageId!,
             provider: 'ses',
             timestamp: new Date(),
           },
         }
       } catch (error) {
         return { success: false, error: new ExternalServiceError('SES send failed', error) }
       }
     }
   }
   ```

   **Implement mock provider** (`providers/mock.ts`):

   ```typescript
   export class MockProvider implements EmailProvider {
     async send(email: EmailMessage): Promise<Result<EmailResult>> {
       console.log('📧 Mock Email:', {
         to: email.to,
         subject: email.subject,
         preview: email.html.substring(0, 100),
       })

       // Save to filesystem for preview
       await fs.writeFile(`./emails/${Date.now()}-${email.to}.html`, email.html)

       return {
         success: true,
         data: {
           messageId: `mock-${Date.now()}`,
           provider: 'mock',
           timestamp: new Date(),
         },
       }
     }
   }
   ```

3. **Template system**:
   - Create 5 MJML templates in `src/templates/`:
     - `verification_email.mjml` - Email verification with button
     - `password_reset.mjml` - Password reset with secure link
     - `invite.mjml` - User invitation
     - `notification.mjml` - System notifications
     - `marketing.mjml` - Marketing emails with unsubscribe link

   **Build renderer** (`src/renderer.ts`):

   ```typescript
   import mjml2html from 'mjml'
   import Handlebars from 'handlebars'
   import { z } from 'zod'

   export async function renderTemplate(
     templateName: string,
     variables: Record<string, any>,
     locale = 'en'
   ): Promise<{ subject: string; html: string; text: string }> {
     // 1. Load template
     const template = await fetchTemplate(templateName, 'latest', locale)

     // 2. Validate variables with Zod
     const schema = getTemplateSchema(templateName)
     const validated = schema.parse(variables)

     // 3. Compile Handlebars
     const compiled = Handlebars.compile(template.mjml)
     const mjmlContent = compiled(validated)

     // 4. Compile MJML to HTML
     const { html, errors } = mjml2html(mjmlContent, {
       validationLevel: 'strict',
     })

     if (errors.length > 0) {
       throw new ValidationError('MJML compilation failed', { errors })
     }

     // 5. Generate plain text version
     const text = htmlToText(html)

     // 6. Compile subject
     const subject = Handlebars.compile(template.subject)(validated)

     return { subject, html, text }
   }

   // Template variable schemas
   const templateSchemas = {
     verification_email: z.object({
       userName: z.string(),
       verificationUrl: z.string().url(),
     }),
     password_reset: z.object({
       userName: z.string(),
       resetUrl: z.string().url(),
       expiresIn: z.string(),
     }),
     // ... more
   }
   ```

4. **Localization support**:
   - Template translations in `src/templates/locales/{locale}/{template}.mjml`
   - Locale detection from user preferences
   - Fallback to English if translation missing

5. **Queue integration** (using BullMQ from `@sv-sdk/cache`):

   ```typescript
   // src/queue.ts
   import { createQueue, Worker } from '@sv-sdk/cache'

   export const emailQueue = createQueue('emails', {
     defaultJobOptions: {
       attempts: 3,
       backoff: { type: 'exponential', delay: 2000 },
     },
   })

   export async function enqueueEmail(
     template: string,
     to: string,
     variables: Record<string, any>,
     options?: { priority?: number; delay?: number }
   ) {
     await emailQueue.add(
       'send',
       {
         template,
         to,
         variables,
       },
       {
         priority: options?.priority,
         delay: options?.delay,
       }
     )
   }

   // Worker
   const worker = new Worker('emails', async (job) => {
     const { template, to, variables } = job.data

     // 1. Render template
     const rendered = await renderTemplate(template, variables)

     // 2. Get provider
     const provider = getProvider()

     // 3. Send email
     const result = await provider.send({
       to,
       from: process.env.EMAIL_FROM!,
       subject: rendered.subject,
       html: rendered.html,
       text: rendered.text,
     })

     // 4. Store send record
     await createEmailSendRecord({
       templateName: template,
       recipient: to,
       status: result.success ? 'sent' : 'failed',
       messageId: result.success ? result.data.messageId : null,
       provider: provider.name,
     })

     return result
   })
   ```

6. **Webhook handling** (`src/webhooks.ts`):
   - Delivery status updates (delivered, bounced, opened, clicked)
   - Unsubscribe handling
   - Complaint handling (spam reports)
   - Webhook signature verification (provider-specific)

7. **Preference management** (schema in `@sv-sdk/db-config`):
   - User email preferences table in `email` schema
   - Unsubscribe functionality
   - Preference center data structure

8. **Cost tracking**:
   - Email send counting per provider
   - Cost estimation utilities

9. **Email authentication setup guide** (`docs/email-auth.md`):
   - SPF: `v=spf1 include:_spf.brevo.com ~all`
   - DKIM configuration
   - DMARC policy setup

10. **Comprehensive tests**:
    - Template rendering and variable validation
    - MJML compilation and error handling
    - Queue job processing with retries
    - Provider integration (mocked API calls)
    - Webhook signature verification

**Performance Targets**:

- Template rendering: < 100ms per email
- Queue throughput: > 100 emails/second
- Provider API latency: < 500ms

**Provider Selection**: Environment variable `EMAIL_PROVIDER=brevo|ses|mock`

**Export**: Email service, template functions, provider interfaces, webhook handlers, queue utilities

---

## Phase 6: Permissions Package

**Package**: `packages/permissions`

**Implementation**:

1. Database schema (in auth schema):
   - `roles` table: id, name, description, permissions (jsonb), is_system
   - `user_roles` junction table: user_id, role_id, granted_at, granted_by
   - `permission_cache` table: for caching computed permissions

2. Implement enhanced RBAC:
   - `can(user, permission, resource?)` function
   - Resource-level permissions (e.g., "edit:own:profile" vs "edit:any:profile")
   - Permission composition (AND, OR logic)
   - Role inheritance (future-proofing)

3. Permission caching layer:
   - Redis cache for user permissions
   - Cache invalidation on role/permission changes
   - TTL-based cache expiry (5 minutes)
   - Fallback to database on cache miss

4. Role management functions:
   - `createRole(name, permissions)`
   - `updateRole(id, data)`
   - `deleteRole(id)` with user reassignment
   - `assignRole(userId, roleId)`
   - `revokeRole(userId, roleId)`

5. Permission constants and helpers:
   - Define all permissions as constants
   - Permission grouping by domain (auth, email, audit, admin)
   - Permission description metadata

6. Seeding script with initial roles:
   - `super_admin`: All permissions
   - `admin`: Most permissions (exclude sensitive ones)
   - `manager`: Limited admin permissions
   - `user`: Basic permissions

7. Audit integration:
   - Log all permission checks (for security auditing)
   - Log role assignments/revocations
   - Track permission denials

8. Context-aware permissions (ABAC foundation):
   - Permission context object (user, resource, time, location)
   - Dynamic permission evaluation
   - Extensibility for future ABAC

9. SvelteKit middleware for route protection

10. Comprehensive tests:
    - Permission checking logic
    - Role assignment and revocation
    - Caching behavior
    - Resource-level permissions

**Model**: RBAC with resource-level granularity and caching

**Export**: Permission functions, role utilities, middleware, permission constants

---

## Phase 7: UI Design System Package

**Package**: `packages/ui`

**Implementation**:

1. Setup Tailwind CSS:
   - Custom configuration with design tokens
   - Dark mode support (class-based)
   - Responsive breakpoints
   - Custom plugins for design system

2. Create design tokens (`tokens.ts`):
   - Color system (light + dark mode)
   - Typography scale
   - Spacing scale
   - Border radius values
   - Shadow system
   - Z-index scale

3. Build accessible Svelte 5 components with full ARIA support:

   **Core Components**:
   - `Button` - keyboard navigation, loading states, variants
   - `Input` - label association, error states, validation messages
   - `TextArea` - auto-resize, character count
   - `Select` - keyboard navigation, search
   - `Checkbox` - indeterminate state
   - `Radio` - group management
   - `Switch` - toggle with labels
   - `Table` - sortable, filterable, pagination, row selection
   - `Modal` - focus trap, ESC to close, backdrop click
   - `Dropdown` - keyboard navigation, positioning

   **Layout Components**:
   - `AppShell` - responsive layout with sidebar
   - `Sidebar` - collapsible, navigation
   - `Navbar` - responsive, dropdown menus
   - `Container` - max-width, centering
   - `Grid` - responsive grid system
   - `Stack` - vertical/horizontal spacing

   **Feedback Components**:
   - `Toast` - auto-dismiss, positioning, stacking
   - `Alert` - variants (info, success, warning, error)
   - `Badge` - variants and sizes
   - `Spinner` - loading indicator
   - `Progress` - determinate and indeterminate
   - `Skeleton` - loading placeholders

   **Specialized Components**:
   - `TemplateEditor` - Monaco editor integration
   - `TemplatePreview` - iframe-based email preview
   - `DataTable` - advanced table with all features
   - `DatePicker` - accessible date selection
   - `Tabs` - keyboard navigation
   - `Accordion` - expandable sections

4. Accessibility requirements:
   - WCAG 2.1 Level AA compliance
   - Full keyboard navigation
   - Screen reader support (tested)
   - Focus indicators
   - Color contrast validation
   - ARIA attributes

5. Internationalization setup:
   - i18n hook for component text
   - RTL support foundation
   - Locale-aware formatting

6. Component documentation:
   - Props documentation
   - Usage examples
   - Accessibility notes
   - Playground/Storybook setup (optional)

7. Responsive design:
   - Mobile-first approach
   - Touch-friendly interactions
   - Responsive typography

8. Form handling utilities:
   - Form validation integration (Zod)
   - Error message display
   - Loading states
   - Success feedback

9. Theme switcher component

10. Comprehensive tests:
    - Component rendering
    - Accessibility (automated testing)
    - Keyboard navigation
    - User interactions

**Styling**: Tailwind CSS + CSS variables for theming + dark mode

**Export**: All components, hooks, utilities, theme system

---

## Phase 8: Admin App

**Location**: `apps/admin` (SvelteKit application)

**Note**: Admin is a deployable application, not a library package, so it lives in `apps/` directory.

**Implementation**:

1. Update existing SvelteKit app structure in `apps/admin/`:
   - Already exists in correct location
   - Configure workspace dependencies to SDK packages

2. Setup authentication:
   - `hooks.server.ts` with BetterAuth integration
   - Session management
   - CSRF protection
   - Permission checks on all routes

3. Implement routes:

   **Authentication**:
   - `/login` - Login form with rate limiting feedback
   - `/logout` - Logout endpoint

   **Dashboard** (`/dashboard`):
   - User count widget
   - Recent audit events
   - Email send statistics
   - System health status
   - Quick actions

   **User Management** (`/users`):
   - User list with search, filter, pagination
   - Create user modal with role assignment
   - Edit user modal
   - Delete user confirmation
   - View user audit history
   - Bulk actions (bulk delete, bulk role assignment)

   **Role & Permission Management** (`/roles`):
   - Role list
   - Create/edit role with permission matrix
   - View users with specific role
   - Role deletion with reassignment

   **Audit Logs** (`/audit`):
   - Log viewer with advanced filters
   - Search functionality
   - Export to CSV/JSON
   - Real-time log streaming (optional)
   - Log retention settings

   **Email Templates** (`/templates`):
   - Template list
   - Template editor with live preview
   - Template versioning
   - Test send functionality
   - MJML validation feedback
   - Template variables documentation

   **Email Analytics** (`/emails`):
   - Send history
   - Delivery statistics
   - Bounce/complaint handling
   - Webhook event viewer

   **Settings** (`/settings`):
   - System configuration
   - Email provider settings
   - Security settings
   - Retention policies

4. API endpoints in `routes/api/`:
   - RESTful API for all admin operations
   - Request validation with Zod
   - Error handling
   - Rate limiting
   - API documentation

   **API Versioning Strategy**:
   - URL-based versioning: `/api/v1/users`, `/api/v2/users`
   - Version in route structure: `routes/api/v1/`, `routes/api/v2/`
   - Maintain backwards compatibility for at least 2 major versions
   - Deprecation timeline: Announce 3 months before removal
   - Version compatibility matrix documented in `/docs/API_VERSIONS.md`
   - Breaking changes require major version bump
   - Response includes API version in headers: `X-API-Version: 1.0.0`

5. Real-time features:
   - WebSocket connection for live updates (optional)
   - Real-time audit log streaming
   - Live email send status

6. Form validation:
   - Client-side validation with Zod
   - Server-side validation
   - Proper error display

7. Loading states and error boundaries:
   - Loading skeletons
   - Error pages (404, 403, 500)
   - Network error handling

8. Responsive design:
   - Mobile-responsive admin interface
   - Touch-friendly controls

9. Security features:
   - All routes protected (except login)
   - Role-based access control on routes
   - CSRF protection on all forms
   - Security headers
   - Audit logging for all admin actions

10. Comprehensive tests:
    - SSR tests for all routes
    - API endpoint tests
    - Permission enforcement tests
    - Form submission tests

**Auth**: Protect all routes except `/login` with admin role check

**Export**: N/A (standalone app)

---

## Phase 9: Demo App

**Package**: `apps/demo-app` (SvelteKit app)

**Implementation**:

1. Create demo SvelteKit application

2. Pages:
   - `/` - Public landing page with SDK feature showcase
   - `/login` - BetterAuth login flow
   - `/signup` - BetterAuth signup with email verification
   - `/verify-email` - Email verification handler
   - `/profile` - Protected page with user info and settings
   - `/reset-password` - Password reset flow

3. Demo features:
   - "Send verification email" button with status feedback
   - "Update profile" form with validation
   - Session management demonstration
   - Permission-based UI rendering

4. Integration demonstrations:
   - `@sv-sdk/auth` integration
   - `@sv-sdk/ui` component usage
   - `@sv-sdk/permissions` client-side checks
   - Event bus subscription examples

5. Developer documentation:
   - Code comments explaining SDK usage
   - Integration patterns documentation
   - Common pitfalls and solutions

6. Error handling examples:
   - Network error handling
   - Validation error display
   - Authentication error handling

7. Responsive design using UI components

8. Basic E2E tests with Playwright:
   - Login/signup flow
   - Email verification
   - Profile update

**Export**: N/A (standalone app)

---

## Phase 10: CLI Package

**Package**: `packages/cli`

**Implementation**:

1. Setup CLI framework (recommend `commander` for simplicity)

2. CLI structure:

   ```
   sdk <command> <subcommand> [options]
   ```

3. Implement commands:

   **Auth Commands**:
   - `sdk auth create-user --email <email> --password <pass> --role <role>`
   - `sdk auth list-users [--role <role>] [--limit <n>]`
   - `sdk auth delete-user --email <email>`
   - `sdk auth reset-password --email <email>`

   **Audit Commands**:
   - `sdk audit export --from <date> --to <date> --format <csv|json>`
   - `sdk audit search --event-type <type> --user <email>`
   - `sdk audit retention --set <days>`

   **Email Commands**:
   - `sdk email send-test --template <name> --to <email> [--vars <json>]`
   - `sdk email list-templates`
   - `sdk email validate-template --file <path>`
   - `sdk email stats [--from <date>] [--to <date>]`

   **Permission Commands**:
   - `sdk permissions list`
   - `sdk permissions grant --role <role> --permission <perm>`
   - `sdk permissions revoke --role <role> --permission <perm>`
   - `sdk permissions check --user <email> --permission <perm>`

   **Database Commands**:
   - `sdk db migrate`
   - `sdk db rollback [--steps <n>]`
   - `sdk db seed`
   - `sdk db backup --output <path>`

   **Development Commands**:
   - `sdk dev setup` - Run complete local setup
   - `sdk dev reset` - Reset local database
   - `sdk health` - Check system health

4. Features:
   - Interactive prompts for missing options
   - Colored output for better readability
   - Progress indicators for long operations
   - Configuration file support (`sdk.config.json`)
   - Environment variable support
   - Verbose mode for debugging

5. Make CLI executable:
   - Binary name: `sdk`
   - npm/pnpm global installation support
   - Workspace-local execution via `pnpm sdk`

6. Help documentation:
   - Comprehensive help text for all commands
   - Examples for common use cases
   - Version command

7. Error handling:
   - User-friendly error messages
   - Exit codes for scripting
   - Debug mode with stack traces

8. Unit tests for all commands

**Export**: CLI binary

---

## Phase 11: Comprehensive Testing & CI

**Tasks**:

1. Setup test infrastructure:
   - Vitest config at root and per package
   - Test database setup/teardown
   - Test Redis instance
   - Test environment configuration

2. Write comprehensive tests:

   **Unit Tests**:
   - `@sv-sdk/shared`: Error classes, utilities
   - `@sv-sdk/db-config`: Schema validation, client connection
   - `@sv-sdk/validators`: All validation functions
   - `@sv-sdk/core`: Plugin system, SDK initialization, event bus
   - `@sv-sdk/security`: Rate limiting, CSRF, sanitization
   - `@sv-sdk/auth`: User CRUD, authentication flows, session management
   - `@sv-sdk/audit`: Log writing, querying, PII masking
   - `@sv-sdk/email`: Template rendering, provider abstraction, queue
   - `@sv-sdk/permissions`: Permission checking, caching, role management
   - `@sv-sdk/ui`: Component rendering, accessibility
   - `@sv-sdk/cli`: Command execution

   **Integration Tests**:
   - Multi-package workflows (create user + send email)
   - Database transactions across schemas
   - Queue processing end-to-end
   - Event bus communication between packages
   - Permission checking with caching
   - Webhook processing

   **E2E Tests** (Playwright):
   - `apps/demo-app`: Complete user flows
   - `packages/admin`: Admin workflows
   - Authentication flows
   - Form submissions
   - Email sending and status

   **Performance Tests**:
   - Audit logging throughput
   - Email queue processing rate
   - Permission check latency
   - Database query performance

   **Accessibility Tests**:
   - Automated a11y testing for UI components
   - Keyboard navigation tests
   - Screen reader compatibility

3. Code quality:
   - ESLint configuration with strict rules
   - Prettier configuration
   - TypeScript strict mode
   - Import order and organization
   - Code coverage targets (80%+ for critical packages)

4. Create `.github/workflows/ci.yml`:

   ```yaml
   - Checkout code
   - Setup Node.js and pnpm
   - Install dependencies (with cache)
   - Lint all packages
   - Type check all packages
   - Run unit tests with coverage
   - Run integration tests
   - Start services (PostgreSQL, Redis)
   - Run migrations
   - Run E2E tests
   - Build all packages
   - Upload coverage reports
   - Dependency vulnerability scan
   - Security audit
   ```

5. Additional workflows:
   - `release.yml` - Automated releases with changesets
   - `security-scan.yml` - Daily security scans
   - `performance.yml` - Performance regression testing

6. Pre-commit hooks:
   - Lint staged files
   - Type check
   - Run affected tests
   - Format code

7. Test utilities:
   - Test database factory
   - Mock data generators
   - Test user factory
   - API test helpers

**Testing Strategy**: Test pyramid - many unit tests, fewer integration tests, critical E2E tests

---

## Phase 12: Documentation

**Files**: `/ARCHITECTURE.md`, `/ADMIN_SPEC.md`, `/SECURITY.md`, package READMEs, `/CONTRIBUTING.md`

**Content**:

1. **ARCHITECTURE.md**:
   - System architecture overview
   - Mermaid diagrams (packages, database schemas, data flow)
   - Technology stack decisions and rationale
   - Plugin system explanation
   - Event flow diagrams
   - Deployment architecture

2. **Database documentation**:
   - Schema diagrams for all domains
   - Relationship diagrams
   - Indexing strategy
   - Migration guide
   - Backup/restore procedures

3. **Quick start guide** (`README.md`):

   ```bash
   # Clone repository
   git clone <repo>

   # Run automated setup
   ./scripts/dev-setup.sh

   # Or manual setup:
   cp .env.example .env
   docker-compose up -d
   pnpm install
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   pnpm dev

   # Access admin panel
   open http://localhost:5173
   # Default credentials: admin@example.com / Admin123!
   ```

4. **Package-specific READMEs**:
   - Installation instructions
   - API documentation
   - Usage examples
   - Configuration options
   - Troubleshooting

5. **SECURITY.md**:
   - Security best practices
   - Vulnerability reporting
   - Security features overview
   - Compliance information

6. **API Documentation**:
   - REST API reference for admin package
   - SDK function reference
   - TypeScript type documentation
   - Code examples

7. **Email template guide**:
   - Template customization
   - MJML introduction
   - Variable system
   - Testing templates
   - Localization

8. **CONTRIBUTING.md**:
   - Development workflow
   - Code style guide
   - PR process
   - Testing requirements
   - Commit message conventions

9. **Operational runbooks**:
   - Deployment procedures
   - Rollback procedures
   - Incident response
   - Monitoring and alerting setup
   - Backup and recovery

10. **Troubleshooting guide**:
    - Common issues and solutions
    - Debug mode instructions
    - Log analysis guide

---

## Phase 13: Production Readiness & Deployment

**Directory**: `/deploy`, `/docs/deployment`

**Content**:

1. **Production architecture diagram**:
   - Infrastructure components
   - Network topology
   - Service dependencies
   - Scaling strategy

2. **Environment variable reference**:
   - Complete list of all env vars
   - Required vs optional
   - Default values
   - Security considerations
   - Secrets management (AWS Secrets Manager, Vault)

3. **Infrastructure as Code** (optional examples):
   - Terraform modules:
     - PostgreSQL (RDS with Multi-AZ)
     - Redis (ElastiCache)
     - Load balancer
     - Container orchestration (ECS/K8s)
   - Docker production images
   - Kubernetes manifests (if applicable)

4. **Deployment guides**:
   - Admin app deployment (Vercel, Netlify, self-hosted)
   - Demo app deployment
   - Queue worker deployment
   - Database migration in production
   - Zero-downtime deployment strategy

5. **Email provider setup**:
   - Brevo account configuration
   - Domain verification
   - SPF/DKIM/DMARC setup
   - Webhook endpoint configuration
   - AWS SES setup (alternative)

6. **Monitoring and observability**:
   - Sentry integration for error tracking
   - Prometheus metrics export
   - Grafana dashboard examples
   - Log aggregation (ELK, Datadog)
   - Uptime monitoring
   - Alert configuration

7. **Performance optimization**:
   - CDN configuration
   - Database query optimization
   - Redis caching strategy
   - Connection pooling
   - Rate limiting configuration

8. **Backup and disaster recovery**:
   - Automated backup schedule
   - Backup retention policy
   - Point-in-time recovery
   - Disaster recovery runbook
   - RTO/RPO targets

9. **Security hardening**:
   - Network security groups
   - WAF configuration
   - SSL/TLS certificate management
   - Secrets rotation schedule
   - Security scanning in production

10. **Scaling strategy**:
    - Horizontal scaling triggers
    - Database scaling (read replicas)
    - Queue worker scaling
    - Cost optimization

11. **Production checklist**:
    - [ ] All environment variables configured
    - [ ] Database migrations applied
    - [ ] Seed data loaded
    - [ ] Email provider configured and verified
    - [ ] Monitoring and alerting set up
    - [ ] Backups configured and tested
    - [ ] Security headers configured
    - [ ] Rate limiting enabled
    - [ ] SSL certificates installed
    - [ ] Health checks passing
    - [ ] Load testing completed
    - [ ] Incident response plan documented
    - [ ] On-call rotation established

---

## Phase 14: Observability & Monitoring (NEW)

**Package**: `packages/observability`

**Implementation**:

1. Metrics collection:
   - Request latency tracking
   - Error rate tracking
   - Queue depth monitoring
   - Email send rate
   - Database connection pool stats
   - Cache hit/miss rates

2. Integration with monitoring platforms:
   - Sentry SDK integration
   - Prometheus metrics exporter
   - Custom metric reporting

3. Distributed tracing (optional):
   - OpenTelemetry integration
   - Trace context propagation
   - Performance bottleneck identification

4. Log aggregation:
   - Structured logging format
   - Log level management
   - Log shipping configuration

5. Health check endpoints:
   - Liveness probe (is service up?)
   - Readiness probe (can service handle traffic?)
   - Dependency health checks

6. Alerting rules:
   - High error rate
   - Queue backup
   - Database connection issues
   - External service failures
   - Disk space warnings

**Export**: Observability middleware, metrics collectors, health check handlers

---

## Execution Strategy

### Development Approach

1. **Incremental Development**:
   - Complete each phase fully before moving to next
   - Run tests after each phase
   - Update documentation as you build
   - Commit frequently with conventional commit messages

2. **Testing Philosophy**:
   - Write tests alongside implementation (not after)
   - Achieve 80%+ coverage for business logic
   - Integration tests for critical workflows
   - E2E tests for user-facing features

3. **Code Review Checkpoints**:
   - Self-review after each phase
   - Check against security checklist
   - Verify accessibility requirements
   - Performance profiling for critical paths

4. **Documentation Updates**:
   - Update relevant docs with each code change
   - Keep examples in sync with code
   - Document breaking changes
   - Maintain changelog

### Production Hardening TODOs

Throughout implementation, mark areas needing production hardening with:

```typescript
// TODO(production): Add retry logic with exponential backoff
// TODO(security): Implement rate limiting
// TODO(performance): Add caching layer
// TODO(monitoring): Add metrics tracking
// TODO(accessibility): Test with screen reader
```

### Package Dependency Order

```
Level 0 (Foundation):
- @sv-sdk/shared

Level 1 (Data Layer):
- @sv-sdk/db-config
- @sv-sdk/cache

Level 2 (Validation & Core):
- @sv-sdk/validators (depends on db-config)
- @sv-sdk/core (depends on shared, db-config, cache)
- @sv-sdk/security (depends on shared, cache)

Level 3 (Domain Features - Can be developed in parallel):
- @sv-sdk/auth (depends on db-config, validators, cache, security, core)
- @sv-sdk/audit (depends on db-config, shared, core)
- @sv-sdk/permissions (depends on db-config, cache, audit)

Level 4 (Advanced Features):
- @sv-sdk/email (depends on db-config, cache, auth, audit)

Level 5 (UI):
- @sv-sdk/ui (depends on auth, permissions)

Level 6 (Applications):
- apps/admin (depends on all packages)
- apps/demo-app (depends on auth, email, ui, permissions)

Level 7 (Tools & Observability):
- @sv-sdk/cli (depends on all feature packages)
- @sv-sdk/observability (depends on core, cache)
```

**See [PHASE_DEPENDENCIES.md](./PHASE_DEPENDENCIES.md) for detailed dependency graph with timelines and parallelization strategies.**

### Validation Checklist (Per Phase)

- [ ] All TypeScript strict checks pass
- [ ] Unit tests written and passing (80%+ coverage)
- [ ] Integration tests for cross-package features
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Accessibility requirements met (for UI)
- [ ] Performance acceptable (profiled)
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Code reviewed (self or peer)

### Common Scripts Across Packages

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

---

## Summary of Key Improvements

1. ✅ **Single database with schemas** instead of 3 separate databases
2. ✅ **Security-first approach** with dedicated security package
3. ✅ **Type safety** with shared validators and runtime checks
4. ✅ **Accessibility** as first-class requirement in UI
5. ✅ **Production readiness** integrated throughout, not just at the end
6. ✅ **Comprehensive testing** strategy with unit, integration, and E2E
7. ✅ **Error handling** as foundational concern
8. ✅ **PII handling** and compliance in audit package
9. ✅ **Permission caching** for performance
10. ✅ **Enhanced email features** (webhooks, tracking, preferences)
11. ✅ **Observability** as dedicated phase
12. ✅ **Developer experience** improvements throughout
13. ✅ **Documentation** as continuous activity
14. ✅ **Clear phase dependencies** and execution strategy

---

## Plan Review Improvements (Latest Update)

This plan was comprehensively reviewed and enhanced with the following critical improvements:

### 1. Database Architecture Clarified ✅

**Problem**: Contradictory references to "single database with schemas" vs "multiple separate databases"

**Solution**:

- Clarified use of **single PostgreSQL database** with **4 PostgreSQL schemas** (auth, email, audit, permissions)
- Single connection string: `DATABASE_URL` pointing to `sv_sdk` database
- Added `DATABASE_DECISION.md` with detailed rationale comparing both approaches
- Updated all phases to consistently reference single database architecture

### 2. New Phases Added ✅

**Phase 0.75: Testing Infrastructure**

- Added before Phase 1 to enable test-driven development from the start
- Vitest configuration, test database utilities, mock factories
- CI-friendly test commands

**Phase 1.75: Redis & Cache Configuration**

- Previously Redis was mentioned but never properly setup
- Centralized Redis client, cache utilities, BullMQ queue factory
- Health checks for Redis connection
- Used by auth (sessions), permissions (caching), email (queues), security (rate limiting)

### 3. BetterAuth + Drizzle Integration Detailed ✅

**Problem**: Phase 3 mentioned "BetterAuth with Drizzle adapter" with no specifics

**Solution**:

- Added specific installation instructions: `better-auth`, `@better-auth/drizzle`, `argon2`
- Detailed BetterAuth configuration with Drizzle adapter
- Schema merging example showing BetterAuth required fields + custom fields
- User service implementation with caching
- SvelteKit hooks integration example

### 4. Email Provider Implementation Detailed ✅

**Problem**: Phase 5 showed interface but lacked real implementation details

**Solution**:

- Complete Brevo provider implementation with webhook signature verification
- Complete AWS SES provider implementation with cost tracking
- Mock provider for local development with email preview
- Actual API call implementations with retry logic and error handling
- Provider-specific error mapping

### 5. Docker Compose Fully Specified ✅

**Problem**: Mentioned `docker-compose.yml` but no actual configuration

**Solution**:

- Complete `docker-compose.yml` structure with PostgreSQL + Redis
- Separate test database service (`postgres-test`)
- Health checks for both services
- Volume configuration for data persistence
- Schema initialization script (`scripts/init-db.sql`)

### 6. Environment Variables Documented ✅

**Problem**: `.env.example` mentioned but no variables listed

**Solution**:

- Comprehensive `.env.example` with all 30+ required variables
- Grouped by concern (Database, Redis, Auth, Email, Security, Features, Monitoring)
- Comments explaining each variable's purpose and valid values
- Security considerations noted

### 7. Admin App Location Standardized ✅

**Problem**: Phase 8 said "Create `packages/admin`" with note "(or keep in apps)"

**Solution**:

- Definitively placed in `apps/admin` (existing location)
- Clarified that admin is a deployable application, not a library
- Consistent with monorepo conventions

### 8. API Versioning Strategy Added ✅

**Problem**: No API versioning strategy specified

**Solution**:

- URL-based versioning: `/api/v1/`, `/api/v2/`
- Backwards compatibility policy (2 major versions)
- Deprecation timeline (3 months notice)
- Version in response headers: `X-API-Version`
- Breaking change policy

### 9. Drizzle-Zod Integration Clarified ✅

**Problem**: Phase 1 said "generate Zod schemas" but Phase 1.5 created manual DTOs without connection

**Solution**:

- Phase 1: Generate base Zod schemas from Drizzle using `drizzle-zod`
- Phase 1.5: Extend generated schemas for DTOs (insert/update/select variants)
- Explicit example showing schema generation and extension
- Single source of truth from database schema → Zod types → TypeScript types

### 10. Migration Orchestration Detailed ✅

**Problem**: "Migration orchestration script" mentioned with no details

**Solution**:

- Complete `scripts/migrate.ts` structure
- Pre-flight checks (connection, permissions)
- Schema-aware migration application
- Rollback procedures with transaction safety
- Migration version tracking

### 11. Performance Targets Added ✅

**Problem**: No performance benchmarks specified

**Solution**:

- Database: Query latency < 50ms, throughput > 1000 records/sec
- Redis: Cache hit < 5ms, target hit rate > 80%
- Email: Template rendering < 100ms, throughput > 100 emails/sec
- Added to relevant phases (1, 1.75, 5)

### 12. Supporting Documentation Created ✅

**New Files**:

- `DATABASE_DECISION.md` - Single DB vs Multi-DB comparison with detailed rationale
- `DEVELOPMENT_WORKFLOW.md` - Daily development guide (first-time setup, common tasks, debugging)
- `PHASE_DEPENDENCIES.md` - Visual dependency graph, timeline estimates, parallelization strategies

### 13. Quick Start Added ✅

**Problem**: README mentioned but no actual quick start

**Solution**:

- Added Quick Start section at top of plan
- 6-step process from clone to running admin
- Links to detailed workflow documentation
- Default credentials provided

### 14. Troubleshooting Section Added ✅

**Problem**: No guidance on common issues

**Solution**:

- Port conflicts
- Database connection failures
- Migration errors
- Redis connection issues
- Build errors
- Added to Phase 0 and DEVELOPMENT_WORKFLOW.md

### 15. Package Dependency Order Updated ✅

**Problem**: Didn't reflect new phases (0.75, 1.75) or parallelization opportunities

**Solution**:

- Reorganized into 8 levels (was 7)
- Added `@sv-sdk/cache` at Level 1
- Clarified dependencies for each level
- Noted parallel work opportunities at Level 3
- Cross-referenced PHASE_DEPENDENCIES.md

### 16. Phase Naming Consistency ✅

**Problem**: Some phases called "Package" others called "App"

**Solution**:

- Packages: `packages/*` → "Package"
- Applications: `apps/*` → "App"
- Phase 8: Changed from "Admin Package" to "Admin App"
- Phase 9: Already correct as "Demo App"

---

## Validation Against Review Goals

### Critical Issues (All Resolved) ✅

1. ✅ **Database Architecture Contradiction** - Clarified single DB with schemas
2. ✅ **BetterAuth + Drizzle Integration** - Detailed implementation added
3. ✅ **Redis Setup Missing** - Phase 1.75 added
4. ✅ **Package Location Inconsistency** - Standardized on `apps/admin`
5. ✅ **Drizzle-Zod Integration** - Clear connection established
6. ✅ **Migration Orchestration** - Detailed script provided
7. ✅ **Email Provider Implementation** - Complete implementations added
8. ✅ **Security Package Placement** - Dependencies clarified
9. ✅ **Testing Infrastructure** - Phase 0.75 added
10. ✅ **Docker Compose Details** - Complete configuration provided

### Structural Improvements (All Completed) ✅

11. ✅ **Development Workflow** - DEVELOPMENT_WORKFLOW.md created
12. ✅ **Phase Dependencies** - PHASE_DEPENDENCIES.md with visual graph
13. ✅ **Environment Variables** - Comprehensive .env.example
14. ✅ **Performance Targets** - Added to data-layer phases
15. ✅ **API Versioning** - Strategy documented in Phase 8
16. ✅ **Detail Rebalancing** - More code examples in Phases 1, 3, 5
17. ✅ **Quick Start Section** - Added at top
18. ✅ **Troubleshooting Section** - Added to Phase 0 and workflow guide

### Files Created ✅

- ✅ `DATABASE_DECISION.md` - 400+ line comparison and rationale
- ✅ `DEVELOPMENT_WORKFLOW.md` - 600+ line daily development guide
- ✅ `PHASE_DEPENDENCIES.md` - 500+ line dependency analysis
- ✅ Updated `IMPLEMENTATION_PLAN.md` - 2400+ lines (was 1364)

### Validation Checklist ✅

- ✅ No circular dependencies between phases
- ✅ Database architecture consistent throughout
- ✅ All packages have clear dependencies
- ✅ Testing strategy established before implementation begins
- ✅ Docker setup complete and actionable
- ✅ BetterAuth integration implementable
- ✅ All environment variables documented
- ✅ Phase dependencies clear and logical

---

## Next Steps

1. Review and approve this enhanced plan
2. Setup development environment (Phase 0)
3. Create project roadmap with timelines
4. Begin implementation starting with Phase 0
5. Schedule regular progress reviews
6. Adjust plan as needed based on learnings

---

**Note**: This plan emphasizes building production-ready software from the start while maintaining development velocity. Each phase builds upon the previous with clear dependencies and validation checkpoints.
