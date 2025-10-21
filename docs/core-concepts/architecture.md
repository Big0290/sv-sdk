# Architecture

Understanding the architecture of SV-SDK will help you build better applications and extend the platform effectively.

## Overview

SV-SDK is built as a **Turborepo monorepo** containing multiple interconnected packages. The architecture follows a modular, plugin-based design that promotes separation of concerns and extensibility.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Your Application                    │
│         (SvelteKit App)                         │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│                 @big0290/core                     │
│  • SDK Initialization                           │
│  • Plugin System                                │
│  • Event Bus                                    │
│  • SDK Context                                  │
└────────┬─────────┬──────────┬────────────┬──────┘
         │         │          │            │
    ┌────▼────┐ ┌─▼────┐  ┌──▼──┐    ┌───▼───┐
    │  Auth   │ │Email │  │Audit│    │  UI   │
    │ Plugin  │ │Plugin│  │Plugin│    │Comps  │
    └────┬────┘ └─┬────┘  └──┬──┘    └───────┘
         │        │          │
    ┌────▼────────▼──────────▼──────┐
    │      Shared Services          │
    │  • Database (PostgreSQL)      │
    │  • Cache (Redis)              │
    │  • Queue (BullMQ)             │
    │  • Logger                     │
    └───────────────────────────────┘
```

## Monorepo Structure

```
sv-sdk/
├── packages/              # Core SDK packages
│   ├── core/             # Plugin system, SDK initialization
│   ├── auth/             # Authentication with BetterAuth
│   ├── permissions/      # RBAC authorization system
│   ├── ui/               # Svelte 5 component library
│   ├── email/            # Email service with templates
│   ├── audit/            # Audit logging system
│   ├── cache/            # Redis caching and BullMQ
│   ├── security/         # Security utilities
│   ├── db-config/        # Database configuration
│   ├── observability/    # Health checks and metrics
│   ├── cli/              # Command-line tools
│   ├── validators/       # Zod validation schemas
│   └── shared/           # Shared utilities and types
│
├── apps/                 # Example applications
│   ├── admin/            # Admin dashboard
│   └── demo-app/         # Demo application
│
├── docs/                 # Documentation site (VitePress)
├── deploy/               # Deployment configurations
│   ├── docker/           # Docker configs
│   ├── k8s/              # Kubernetes manifests
│   └── terraform/        # Infrastructure as code
│
└── test/                 # Shared test utilities
    ├── integration/      # Integration tests
    ├── performance/      # Performance benchmarks
    └── utils/            # Test helpers
```

## Package Dependency Graph

```
Core Packages (No dependencies):
- @big0290/shared       # Utilities, types, constants

Database Layer:
- @big0290/db-config    # ← @big0290/shared
- @big0290/cache        # ← @big0290/shared

Validation Layer:
- @big0290/validators   # ← @big0290/shared

Core SDK:
- @big0290/core         # ← @big0290/shared, @big0290/db-config, @big0290/cache

Feature Packages:
- @big0290/auth         # ← @big0290/core, @big0290/cache, @big0290/db-config, @big0290/validators
- @big0290/permissions  # ← @big0290/core, @big0290/cache, @big0290/db-config, @big0290/auth
- @big0290/email        # ← @big0290/core, @big0290/cache, @big0290/db-config
- @big0290/audit        # ← @big0290/core, @big0290/db-config
- @big0290/security     # ← @big0290/core, @big0290/cache

Utility Packages:
- @big0290/observability # ← @big0290/core, @big0290/cache, @big0290/db-config
- @big0290/cli          # ← All packages

UI Package (Independent):
- @big0290/ui           # ← Only Svelte/Tailwind dependencies
```

## Core Components

### 1. SDK Core (`@big0290/core`)

The foundation of SV-SDK that provides:

**Plugin System:**

- Plugin registration and lifecycle management
- Dependency resolution
- Plugin metadata and versioning

**Event Bus:**

- Type-safe event emitter for inter-plugin communication
- Async event handling
- Event logging for debugging

**SDK Context:**

- Unified access to services (db, redis, logger, eventBus)
- Service registry for plugin-provided services
- Configuration management

**Example:**

```typescript
import { createSDK } from '@big0290/core'

const sdk = await createSDK({
  config: { name: 'my-app', version: '1.0.0' },
  plugins: [authPlugin, emailPlugin, auditPlugin],
})

// Access services via context
const { db, redis, logger, eventBus } = sdk.context
```

### 2. Database Layer (`@big0290/db-config`)

PostgreSQL database management with Drizzle ORM:

**Features:**

- Schema definitions for all modules
- Migration management
- Connection pooling
- Backup and restore utilities

**Database Schemas:**

```
auth schema:
- users
- sessions
- accounts
- verification_tokens

permissions schema:
- roles
- user_roles
- role_permissions

email schema:
- email_templates
- email_history
- email_webhooks

audit schema:
- audit_logs
- audit_log_integrity
```

### 3. Cache Layer (`@big0290/cache`)

Redis-based caching and queue system:

**Caching:**

- Key-value caching with TTL
- Pattern-based invalidation
- Multi-get/set operations
- Health monitoring

**Queues:**

- BullMQ job processing
- Retry strategies
- Job scheduling
- Queue metrics

### 4. Authentication (`@big0290/auth`)

User authentication powered by BetterAuth:

**Components:**

- Auth flows (login, signup, logout)
- User service (CRUD operations)
- Session service (session management)
- Password policy enforcement

**Integration:**

```typescript
// In hooks.server.ts
const session = await auth.api.getSession({
  headers: event.request.headers,
})
event.locals.user = session?.user || null
```

### 5. Authorization (`@big0290/permissions`)

RBAC permission system:

**Permission Model:**

```
Format: action:scope:resource

Examples:
- read:any:user     # Read any user
- update:own:profile # Update own profile
- *:*:*             # Wildcard (super admin)
```

**Components:**

- Role service (role management)
- Permission checker (with caching)
- Middleware (route protection)
- RBAC utilities

### 6. Email System (`@big0290/email`)

Comprehensive email solution:

**Components:**

- Email service (sending)
- Template renderer (MJML → HTML)
- Queue processor (BullMQ)
- Webhook handler (delivery tracking)
- Provider abstraction (Brevo, SES, Mock)

**Flow:**

```
sendEmail()
  ↓
enqueueEmail()
  ↓
BullMQ Queue
  ↓
Worker picks up job
  ↓
renderTemplate() → MJML → HTML
  ↓
Provider sends email
  ↓
Webhook updates status
```

### 7. Audit Logging (`@big0290/audit`)

Complete audit trail:

**Features:**

- Structured event logging
- PII masking and encryption
- Retention policies
- Integrity verification
- Query and export

**Log Structure:**

```typescript
{
  id: string
  event: string            // e.g., "user.login"
  userId?: string
  resource?: string
  action?: string
  changes?: object
  metadata: object
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
```

### 8. UI Components (`@big0290/ui`)

Svelte 5 component library:

**Categories:**

- Forms (Input, Button, Select, Checkbox, etc.)
- Layout (Card, Container, Grid, Stack)
- Feedback (Alert, Toast, Modal, Spinner)
- Navigation (Navbar, Sidebar, Tabs, Dropdown)
- Data Display (Table, Badge, Avatar)
- Media (Audio, Video, VideoChat)

**Features:**

- Dark mode support
- Accessibility (WCAG 2.1 AA)
- Internationalization
- Customizable theming

## Data Flow

### Authentication Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. auth.login({ email, password })
   ↓
4. Verify credentials (BetterAuth)
   ↓
5. Create session in database
   ↓
6. Cache session in Redis
   ↓
7. Log audit event
   ↓
8. Return session cookie
```

### Permission Check Flow

```
1. Request arrives at protected route
   ↓
2. Middleware extracts user from session
   ↓
3. can(userId, 'read:any:user')
   ↓
4. Check Redis cache
   ├─ Cache hit → Return result
   └─ Cache miss ↓
5. Query database for user roles
   ↓
6. Query permissions for roles
   ↓
7. Check permission match
   ↓
8. Cache result in Redis (5 min TTL)
   ↓
9. Return allowed/denied
```

### Email Sending Flow

```
1. sendEmail(template, recipient, variables)
   ↓
2. Validate template exists
   ↓
3. Enqueue job in BullMQ
   ↓
4. Worker picks up job
   ↓
5. Load template from database
   ↓
6. Render MJML with Handlebars variables
   ↓
7. Convert MJML → HTML
   ↓
8. Send via provider (Brevo/SES)
   ↓
9. Save to email_history
   ↓
10. Provider webhook updates status
```

## Design Principles

### 1. Modularity

Each package has a single, well-defined responsibility:

- **Loose coupling**: Packages depend on interfaces, not implementations
- **High cohesion**: Related functionality grouped together
- **Clear boundaries**: Well-defined APIs between packages

### 2. Type Safety

Full TypeScript support throughout:

```typescript
// Type-safe events
eventBus.emit('user.created', user) // Type-checked

// Type-safe permissions
can(userId, 'read:any:user') // Autocomplete and validation

// Type-safe configuration
const config = ConfigService.get<DatabaseConfig>('database')
```

### 3. Performance

Optimized for production use:

- **Caching**: Redis caching for frequently accessed data
- **Connection pooling**: Database and Redis connections
- **Lazy loading**: Load only what you need
- **Batch operations**: Bulk inserts and updates
- **Queue processing**: Async operations via BullMQ

### 4. Security

Security best practices built-in:

- **Input validation**: Zod schemas for all inputs
- **SQL injection prevention**: Parameterized queries via Drizzle
- **XSS protection**: Input sanitization
- **CSRF protection**: Token-based CSRF validation
- **Rate limiting**: Per-user and per-IP rate limits
- **Security headers**: HSTS, CSP, X-Frame-Options

### 5. Observability

Monitor system health:

- **Health checks**: Database, Redis, and service health
- **Metrics**: Request counts, latencies, errors
- **Logging**: Structured logging with Pino
- **Audit trail**: Complete audit log for compliance

## Extension Points

### 1. Custom Plugins

Create your own plugins:

```typescript
import { createPlugin } from '@big0290/core'

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  dependencies: ['auth'],
  lifecycle: {
    async init(ctx) {
      ctx.logger.info('Initializing my plugin')
      ctx.registerService('myService', {
        /* ... */
      })
    },
  },
})
```

### 2. Custom Email Templates

Add your own templates:

```sql
INSERT INTO email.email_templates (name, subject, mjml, variables)
VALUES (
  'custom_email',
  'Custom Subject',
  '<mjml>...</mjml>',
  ARRAY['userName', 'customVar']
);
```

### 3. Custom Permissions

Define application-specific permissions:

```typescript
const CUSTOM_PERMISSIONS = {
  INVOICE_CREATE: 'create:any:invoice',
  INVOICE_APPROVE: 'approve:any:invoice',
  REPORT_VIEW: 'read:any:report',
}
```

### 4. Custom UI Components

Build on top of UI components:

```svelte
<script>
  import { Card, Button } from '@big0290/ui'

  // Your custom component
</script>

<Card>
  <h2>Custom Card</h2>
  <Button>Action</Button>
</Card>
```

## Scaling Considerations

### Horizontal Scaling

SV-SDK supports horizontal scaling:

- **Stateless services**: No server-side state (sessions in database/Redis)
- **Shared cache**: Redis for cross-instance caching
- **Queue workers**: Multiple workers can process jobs
- **Database pooling**: Connection limits per instance

### Database Scaling

- **Read replicas**: Route reads to replicas
- **Connection pooling**: Limit connections per instance
- **Indexing**: Proper indexes on frequently queried columns
- **Partitioning**: Partition large tables (audit logs)

### Cache Scaling

- **Redis cluster**: Scale Redis horizontally
- **Cache hierarchy**: L1 (memory) + L2 (Redis)
- **Cache warming**: Pre-populate cache on startup

## Next Steps

- [Plugin System →](/core-concepts/plugin-system)
- [Event Bus →](/core-concepts/event-bus)
- [Deployment Guide →](/guides/deployment)
