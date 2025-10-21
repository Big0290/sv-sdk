# Introduction

Welcome to SV-SDK - a comprehensive full-stack platform for building secure, scalable Svelte 5 applications with authentication, authorization, email, audit logging, and more.

## What is SV-SDK?

SV-SDK is a production-ready SDK that provides everything you need to build modern web applications:

- **🔐 Authentication**: Secure user authentication with BetterAuth, including login, signup, password reset, email verification, and session management
- **🛡️ Authorization**: Flexible RBAC (Role-Based Access Control) system with resource-level permissions
- **📧 Email**: Complete email system with MJML templates, queue processing, and webhook tracking
- **📊 Audit**: Comprehensive audit logging with PII masking and retention policies
- **🎨 UI Components**: 100+ beautiful, accessible Svelte 5 components
- **⚡ Performance**: Redis caching and BullMQ background job processing
- **🔒 Security**: Rate limiting, CSRF protection, and security best practices

## Why Choose SV-SDK?

### Built Specifically for Svelte 5

Unlike generic authentication libraries, SV-SDK is designed from the ground up for Svelte 5:

```svelte
<script>
  import { Button, Input } from '@sv-sdk/ui'

  // Native Svelte 5 runes
  let email = $state('')
  let loading = $state(false)
</script>

<Input bind:value={email} label="Email" />
<Button {loading}>Submit</Button>
```

### Complete Solution

Stop piecing together multiple libraries. SV-SDK includes everything:

```typescript
// One SDK, everything you need
import { auth } from '@sv-sdk/auth'
import { can, enforce } from '@sv-sdk/permissions'
import { sendEmail } from '@sv-sdk/email'
import { logAudit } from '@sv-sdk/audit'
import { Button, Input, Card } from '@sv-sdk/ui'
```

### Production Ready

SV-SDK is battle-tested in production environments:

- ✅ **High Volume**: Handle 1000+ authentication requests per minute
- ✅ **Scalable**: Horizontal scaling with Redis and PostgreSQL
- ✅ **Secure**: Industry-standard security practices built-in
- ✅ **Compliant**: GDPR, SOC 2, and HIPAA compliance features
- ✅ **Monitored**: Health checks and observability

### Developer Experience

Built with developers in mind:

- **TypeScript First**: Full type safety across all packages
- **Comprehensive Docs**: Detailed guides and API references
- **CLI Tools**: Command-line utilities for common tasks
- **Testing Utilities**: Helpers for writing tests
- **Error Messages**: Clear, actionable error messages

## Key Features

### Authentication System

Complete authentication powered by [BetterAuth](https://www.better-auth.com/):

- Email/password authentication with Argon2 hashing
- Session management with database-backed storage
- Password policies and strength validation
- Email verification and password reset flows
- Rate limiting on authentication endpoints
- Session revocation and management
- User CRUD operations with caching

**Coming Soon**: MFA (TOTP, SMS), Social Login (Google, GitHub), Magic Links, Passkeys

### Authorization System

Flexible RBAC with fine-grained permissions:

- Permission format: `action:scope:resource` (e.g., `read:any:user`)
- Resource-level permissions with ownership checks
- Redis-cached permission lookups (< 5ms)
- Wildcard permissions for super admins
- Role management with user assignment
- SvelteKit middleware for route protection
- Audit logging for all permission changes

### Email System

Professional email capabilities:

- MJML templates for responsive emails
- Multi-provider support (Brevo, AWS SES, Mock)
- BullMQ queue processing with retries
- Webhook handling for delivery tracking
- Handlebars variables for dynamic content
- Multi-language support
- Cost tracking and statistics

### UI Component Library

100+ production-ready components:

- Built with Svelte 5 and Tailwind CSS
- Full dark mode support
- WCAG 2.1 Level AA accessibility
- i18n support out of the box
- Customizable design tokens
- Responsive and mobile-first
- TypeScript types included

### Audit Logging

Complete audit trail for compliance:

- Structured event logging
- PII masking and encryption
- Configurable retention policies
- Query and export capabilities
- Integrity verification
- GDPR compliance features

### Security Features

Built-in security best practices:

- Rate limiting with Redis
- CSRF protection
- Security headers (CSP, HSTS, etc.)
- Input sanitization
- Password breach checking
- Secrets management
- Security audit utilities

## Architecture

SV-SDK is built as a **Turborepo monorepo** with 13 packages:

```
sv-sdk/
├── packages/
│   ├── core/          # Plugin system & SDK initialization
│   ├── auth/          # Authentication (BetterAuth)
│   ├── permissions/   # RBAC authorization
│   ├── ui/            # Svelte 5 component library
│   ├── email/         # Email system with queues
│   ├── audit/         # Audit logging
│   ├── cache/         # Redis & BullMQ
│   ├── security/      # Security utilities
│   ├── db-config/     # Database (Drizzle ORM)
│   ├── observability/ # Health checks & metrics
│   ├── cli/           # Command-line tools
│   ├── validators/    # Zod schemas
│   └── shared/        # Shared utilities
└── apps/
    ├── admin/         # Admin dashboard example
    └── demo-app/      # Demo application
```

Learn more about the [Architecture →](/core-concepts/architecture)

## Technology Stack

SV-SDK is built with modern, production-proven technologies:

- **Framework**: [Svelte 5](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Authentication**: [BetterAuth](https://www.better-auth.com/)
- **Database**: [PostgreSQL 14+](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Cache/Queue**: [Redis](https://redis.io/), [BullMQ](https://docs.bullmq.io/)
- **Email**: [MJML](https://mjml.io/)
- **Build**: [Turborepo](https://turbo.build/), [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Use Cases

SV-SDK is perfect for:

### SaaS Applications

Build multi-tenant SaaS products with:

- User authentication and team management
- Subscription and billing integration
- Role-based access control per tenant
- Audit logs for compliance
- Email notifications and transactional emails

### Admin Dashboards

Create powerful admin interfaces with:

- User management (CRUD operations)
- Role and permission management
- Email template editor
- Audit log viewer
- System health monitoring

### E-commerce Platforms

Build secure e-commerce sites with:

- Customer authentication
- Order management with permissions
- Transactional email notifications
- Admin panel for staff
- Audit trail for orders and payments

### Internal Tools

Develop company internal tools with:

- SSO integration (coming soon)
- Fine-grained access control
- Audit logging for compliance
- Email notifications
- Custom workflows

## Getting Help

If you need assistance:

- 📖 **Documentation**: You're reading it! Explore the sidebar for detailed guides
- 💬 **Discord**: Join our [community server](https://discord.gg/your-server)
- 🐛 **GitHub Issues**: Report bugs on [GitHub](https://github.com/your-org/sv-sdk/issues)
- 📧 **Email**: Contact support@yourdomain.com
- 🐦 **Twitter**: Follow [@your_handle](https://twitter.com/your_handle)

## Next Steps

Ready to get started?

1. [Installation →](/getting-started/installation) - Set up your development environment
2. [Quick Start →](/getting-started/quick-start) - Build your first app in 5 minutes
3. [Configuration →](/getting-started/configuration) - Configure the SDK for your needs

Or explore specific topics:

- [Authentication Guide →](/guides/authentication)
- [Permission System →](/guides/permissions)
- [Email Setup →](/guides/email-setup)
- [Deployment →](/guides/deployment)
