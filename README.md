# SV-SDK

> A comprehensive full-stack authentication, authorization, and platform SDK for Svelte 5 applications

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## What is SV-SDK?

SV-SDK is a production-ready, enterprise-grade SDK platform built specifically for **Svelte 5** and **SvelteKit** applications. It provides everything you need to build secure, scalable web applications with authentication, authorization, email, audit logging, and more—all in a unified, type-safe package.

Built with modern technologies including **BetterAuth**, **Drizzle ORM**, **Redis**, **BullMQ**, and **PostgreSQL**, SV-SDK offers a complete solution for building SaaS applications, admin dashboards, and complex web platforms.

### Why SV-SDK?

- **🔐 Battle-Tested Authentication** - Secure user auth with BetterAuth, Argon2 hashing, and session management
- **🛡️ Granular Permissions** - Flexible RBAC system with resource-level permissions and caching
- **📧 Reliable Email** - MJML templates, multi-provider support, queue processing, and webhook tracking
- **📊 Comprehensive Audit** - Complete audit trail with PII masking, retention policies, and compliance features
- **🎨 Beautiful UI Components** - 100+ Svelte 5 components with dark mode, accessibility, and i18n
- **⚡ High Performance** - Redis caching, BullMQ queues, connection pooling, and optimized queries
- **🔒 Security First** - Rate limiting, CSRF protection, security headers, input sanitization
- **🔌 Plugin Architecture** - Extensible plugin system with event bus and dependency resolution
- **🛠️ Developer Experience** - Comprehensive CLI, TypeScript types, extensive documentation
- **📦 Monorepo Ready** - Built with Turborepo for optimal build performance

## Key Features

### 📦 Packages

| Package                                            | Description                                     | Version |
| -------------------------------------------------- | ----------------------------------------------- | ------- |
| [@big0290/core](./packages/core)                   | SDK initialization, plugin system, event bus    | 0.0.1   |
| [@big0290/auth](./packages/auth)                   | Authentication with BetterAuth, user management | 0.0.1   |
| [@big0290/permissions](./packages/permissions)     | RBAC permissions system with caching            | 0.0.1   |
| [@big0290/ui](./packages/ui)                       | Svelte 5 component library with 100+ components | 0.0.1   |
| [@big0290/email](./packages/email)                 | Email system with MJML, queues, webhooks        | 0.0.1   |
| [@big0290/audit](./packages/audit)                 | Audit logging, retention, compliance            | 0.0.1   |
| [@big0290/cache](./packages/cache)                 | Redis caching and BullMQ queue system           | 0.0.1   |
| [@big0290/security](./packages/security)           | Rate limiting, CSRF, security headers           | 0.0.1   |
| [@big0290/db-config](./packages/db-config)         | Database configuration with Drizzle ORM         | 0.0.1   |
| [@big0290/observability](./packages/observability) | Health checks, metrics, monitoring              | 0.0.1   |
| [@big0290/cli](./packages/cli)                     | Command-line interface for SDK management       | 0.0.1   |
| [@big0290/validators](./packages/validators)       | Zod schemas and validation utilities            | 0.0.1   |
| [@big0290/shared](./packages/shared)               | Shared utilities, types, constants              | 0.0.1   |

## Architecture Overview

SV-SDK is built as a **Turborepo monorepo** with a modular architecture:

```
sv-sdk/
├── packages/           # Core SDK packages
│   ├── core/          # Plugin system & SDK initialization
│   ├── auth/          # Authentication (BetterAuth)
│   ├── permissions/   # RBAC system
│   ├── ui/            # Svelte 5 components
│   ├── email/         # Email service
│   ├── audit/         # Audit logging
│   ├── cache/         # Redis & BullMQ
│   ├── security/      # Security utilities
│   └── ...
├── apps/              # Example applications
│   ├── admin/         # Admin dashboard
│   └── demo-app/      # Demo application
├── docs/              # Documentation site
└── deploy/            # Deployment configs
```

### Core Architecture

```
┌─────────────────────────────────────────────────┐
│                   SV-SDK Core                    │
│  (Plugin System, Event Bus, SDK Context)         │
└────────────┬────────────────────────────────────┘
             │
     ┌───────┴───────┐
     │   Plugins     │
     └───────┬───────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───▼───┐ ┌──▼──┐ ┌──▼───┐
│ Auth  │ │Email│ │Audit │
│Plugin │ │Plug │ │Plugin│
└───┬───┘ └──┬──┘ └──┬───┘
    │        │       │
    └────────┼───────┘
          ┌──▼──┐
          │Cache│
          │Redis│
          └─────┘
```

**Key Concepts:**

- **Plugin System**: Modular architecture with dependency resolution
- **Event Bus**: Type-safe communication between plugins
- **SDK Context**: Unified access to services (db, redis, logger, eventBus)
- **Graceful Shutdown**: Proper cleanup and connection closing

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** >= 14
- **Redis** >= 6

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sv-sdk.git
cd sv-sdk

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Configuration

Create your configuration file:

```json
{
  "database": {
    "url": "postgresql://sv_sdk_user:password@localhost:5432/sv_sdk",
    "pool": {
      "max": 20,
      "min": 5
    }
  },
  "redis": {
    "url": "redis://localhost:6379"
  },
  "auth": {
    "sessionTimeout": 43200,
    "maxLoginAttempts": 5,
    "passwordPolicy": {
      "minLength": 12,
      "requireNumbers": true,
      "requireSpecialChars": true,
      "requireUppercase": true
    }
  },
  "email": {
    "provider": "brevo",
    "from": "noreply@example.com",
    "queue": {
      "concurrency": 5,
      "retries": 3
    }
  }
}
```

**Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://sv_sdk_user:password@localhost:5432/sv_sdk

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
BETTER_AUTH_SECRET=your_secret_key_min_32_chars_long_random_string
BETTER_AUTH_URL=http://localhost:5173

# Email (Brevo)
EMAIL_PROVIDER=brevo
EMAIL_FROM=noreply@yourdomain.com
BREVO_API_KEY=your_brevo_api_key
```

### 3. Database Setup

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (creates default roles, templates, etc.)
pnpm db:seed
```

### 4. Start Development

```bash
# Start all apps in development mode
pnpm dev

# Or start specific apps
pnpm --filter @big0290/admin dev
pnpm --filter demo-app dev
```

### 5. Your First Application

Create a SvelteKit app and integrate SV-SDK:

**Install packages:**

```bash
pnpm add @big0290/auth @big0290/permissions @big0290/ui
```

**Configure hooks (`src/hooks.server.ts`):**

```typescript
import type { Handle } from '@sveltejs/kit'
import { auth } from '@big0290/auth'
import { checkRoutePermission } from '@big0290/permissions'
import { rateLimiter } from '@big0290/security'
import { logAudit } from '@big0290/audit'

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url
  const ipAddress = event.getClientAddress()

  // Get session from BetterAuth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Attach user to event.locals
  event.locals.user = session?.user || null
  event.locals.session = session || null

  // Rate limiting on API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = session?.user?.id || ipAddress
    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, {
      max: 100,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimitResult.allowed) {
      return new Response('Too many requests', { status: 429 })
    }
  }

  // Public routes
  const publicRoutes = ['/login', '/signup', '/health']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return resolve(event)
  }

  // Require authentication
  if (!session?.user) {
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirect=${encodeURIComponent(pathname)}`,
      },
    })
  }

  // Check permissions
  const routeCheck = await checkRoutePermission(session.user.id, pathname)
  if (!routeCheck.allowed) {
    await logAudit('unauthorized_access', {
      userId: session.user.id,
      pathname,
      ipAddress,
    })
    return new Response('Forbidden', { status: 403 })
  }

  return resolve(event)
}
```

**Use UI components:**

```svelte
<script>
  import { Button, Input, Card, Alert } from '@big0290/ui'

  let email = $state('')
  let password = $state('')
  let error = $state('')

  async function handleLogin() {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      window.location.href = '/dashboard'
    } else {
      error = 'Invalid credentials'
    }
  }
</script>

<Card>
  <h2>Login</h2>

  {#if error}
    <Alert variant="error" dismissible bind:visible={error}>
      {error}
    </Alert>
  {/if}

  <Input type="email" label="Email" bind:value={email} required />

  <Input type="password" label="Password" bind:value={password} required />

  <Button variant="primary" onclick={handleLogin} fullWidth>Sign In</Button>
</Card>
```

## Usage Examples

### Authentication Flow

```typescript
import { login, signup, logout } from '@big0290/auth'

// User signup
const signupResult = await signup(
  {
    email: 'user@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    name: 'John Doe',
  },
  {
    ipAddress: '127.0.0.1',
  }
)

if (signupResult.success) {
  const { user, session } = signupResult.data
  console.log('User created:', user.id)
}

// User login
const loginResult = await login(
  {
    email: 'user@example.com',
    password: 'SecurePassword123!',
  },
  {
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
  }
)

// Logout
await logout(sessionToken)
```

### Permission Checking

```typescript
import { can, enforce, assignRole } from '@big0290/permissions'

// Check permission
const canEdit = await can('user-123', 'update:any:user')

if (canEdit) {
  // User can edit
}

// Enforce permission (throws if denied)
await enforce('user-123', 'delete:any:email')

// Assign role to user
await assignRole('user-123', 'admin-role-id', 'assigner-id')
```

### Email Sending

```typescript
import { sendEmail, sendEmailImmediate } from '@big0290/email'

// Send via queue (recommended)
const result = await sendEmail('verification_email', 'user@example.com', {
  userName: 'John Doe',
  verificationUrl: 'https://app.com/verify?token=abc123',
})

// Send immediately (critical emails)
await sendEmailImmediate('password_reset', 'user@example.com', {
  userName: 'John Doe',
  resetUrl: 'https://app.com/reset?token=xyz789',
  expiresIn: '1 hour',
})
```

### Audit Logging

```typescript
import { logAudit, queryAuditLogs } from '@big0290/audit'

// Log an event
await logAudit('user.login', {
  userId: 'user-123',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
})

// Query audit logs
const logs = await queryAuditLogs(
  {
    event: 'user.login',
    userId: 'user-123',
    startDate: new Date('2024-01-01'),
    endDate: new Date(),
  },
  {
    page: 1,
    pageSize: 50,
  }
)
```

### Rate Limiting

```typescript
import { rateLimiter } from '@big0290/security'

// Check rate limit
const result = await rateLimiter.checkLimit('user-123', {
  max: 10,
  windowMs: 60000, // 1 minute
})

if (!result.allowed) {
  console.log(`Rate limit exceeded. Reset in ${result.resetIn}ms`)
}
```

## Documentation

📚 **[Full Documentation](./docs)** - Comprehensive guides and API reference

- [Getting Started](./docs/getting-started/introduction.md)
- [Architecture](./docs/core-concepts/architecture.md)
- [Authentication Guide](./docs/guides/authentication.md)
- [API Reference](./docs/api)
- [Examples](./docs/examples)

### Package Documentation

Each package has detailed documentation:

- [Core SDK](./packages/core/README.md) - SDK initialization and plugins
- [Authentication](./packages/auth/README.md) - User auth and sessions
- [Permissions](./packages/permissions/README.md) - RBAC system
- [UI Components](./packages/ui/README.md) - Component library
- [Email](./packages/email/README.md) - Email service
- [Audit](./packages/audit/README.md) - Audit logging
- [Cache](./packages/cache/README.md) - Redis and queues
- [Security](./packages/security/README.md) - Security utilities
- [CLI](./packages/cli/README.md) - Command-line tools

## Development

### Project Structure

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Build all packages
pnpm build

# Database operations
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:studio     # Open Drizzle Studio
```

### Scripts

| Script                  | Description                        |
| ----------------------- | ---------------------------------- |
| `pnpm dev`              | Start all apps in development mode |
| `pnpm build`            | Build all packages and apps        |
| `pnpm test`             | Run all tests                      |
| `pnpm test:unit`        | Run unit tests                     |
| `pnpm test:integration` | Run integration tests              |
| `pnpm test:coverage`    | Generate coverage report           |
| `pnpm lint`             | Run ESLint                         |
| `pnpm lint:fix`         | Fix linting issues                 |
| `pnpm format`           | Format code with Prettier          |
| `pnpm type-check`       | TypeScript type checking           |
| `pnpm db:generate`      | Generate database migrations       |
| `pnpm db:migrate`       | Run database migrations            |
| `pnpm db:seed`          | Seed database with initial data    |
| `pnpm db:studio`        | Open Drizzle Studio                |

### Using the CLI

```bash
# List users
pnpm sdk auth list --role admin

# Create user
pnpm sdk auth create --email user@example.com --name "John Doe"

# Send test email
pnpm sdk email test --template verification_email --recipient test@example.com

# Export audit logs
pnpm sdk audit export --from 2024-01-01 --to 2024-12-31 --format csv

# Check system health
pnpm sdk health

# Database operations
pnpm sdk db migrate
pnpm sdk db seed
```

## Deployment

### Docker

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

See [Docker Deployment Guide](./docs/deployment/docker-deployment.md)

### Kubernetes

```bash
# Apply configurations
kubectl apply -f deploy/k8s/

# Check status
kubectl get pods -n sv-sdk
```

See [Kubernetes Deployment Guide](./docs/deployment/k8s-deployment.md)

### Production Checklist

Before deploying to production:

- ✅ Change `BETTER_AUTH_SECRET` to a strong random string (min 32 chars)
- ✅ Use production database with connection pooling
- ✅ Configure Redis for persistence
- ✅ Set up email provider (Brevo, AWS SES)
- ✅ Configure domain authentication (SPF, DKIM, DMARC)
- ✅ Enable rate limiting and CSRF protection
- ✅ Set up monitoring and alerts
- ✅ Configure backup strategy
- ✅ Review security headers
- ✅ Enable audit logging
- ✅ Set appropriate session timeouts
- ✅ Configure HTTPS/TLS

See [Production Checklist](./docs/deployment/production-checklist.md)

## Technology Stack

- **Framework**: Svelte 5, SvelteKit
- **Language**: TypeScript 5.9
- **Authentication**: BetterAuth
- **Database**: PostgreSQL 14+ with Drizzle ORM
- **Cache/Queue**: Redis, BullMQ
- **Email**: MJML, Brevo/AWS SES
- **Build**: Turborepo, Vite
- **Testing**: Vitest, Playwright
- **Styling**: Tailwind CSS
- **CLI**: Commander.js

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/sv-sdk.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Run tests: `pnpm test`
6. Commit: `git commit -m "feat: add your feature"`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

## Roadmap

### Planned Features

- [ ] Multi-Factor Authentication (MFA) - TOTP, SMS, Email OTP
- [ ] Social Login - Google, GitHub, Microsoft
- [ ] Magic Links - Passwordless authentication
- [ ] Passkeys - WebAuthn support
- [ ] Advanced ABAC - Attribute-based access control
- [ ] GraphQL API - Alternative to REST
- [ ] Real-time features - WebSocket support
- [ ] File upload/storage - S3 integration
- [ ] Payment integration - Stripe helpers
- [ ] Multi-tenancy - Tenant isolation

## License

MIT © [Your Name/Organization]

See [LICENSE](./LICENSE) for details.

## Support

- 📖 [Documentation](./docs)
- 💬 [Discord Community](https://discord.gg/your-server)
- 🐛 [Issue Tracker](https://github.com/your-org/sv-sdk/issues)
- 📧 Email: support@yourdomain.com
- 🐦 Twitter: [@your_handle](https://twitter.com/your_handle)

## Acknowledgments

Built with excellent open-source projects:

- [Svelte](https://svelte.dev/) - The incredible reactive framework
- [BetterAuth](https://www.better-auth.com/) - Modern authentication
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Turborepo](https://turbo.build/) - High-performance monorepo
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

**Made with ❤️ for the Svelte community**
