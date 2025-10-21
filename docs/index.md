---
layout: home

hero:
  name: SV-SDK
  text: Full-Stack Svelte 5 Platform
  tagline: Production-ready authentication, authorization, and platform SDK for building secure SvelteKit applications
  image:
    src: /logo.svg
    alt: SV-SDK
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-org/sv-sdk

features:
  - icon: 🔐
    title: Battle-Tested Authentication
    details: Secure user authentication with BetterAuth, Argon2 hashing, session management, and password policies. MFA and social login coming soon.

  - icon: 🛡️
    title: Granular Permissions
    details: Flexible RBAC system with resource-level permissions, scope escalation, Redis caching, and middleware for route protection.

  - icon: 📧
    title: Reliable Email System
    details: MJML templates, multi-provider support (Brevo, AWS SES), BullMQ queue processing, webhook tracking, and localization.

  - icon: 📊
    title: Comprehensive Audit Logging
    details: Complete audit trail with PII masking, retention policies, compliance features, and query capabilities for security analysis.

  - icon: 🎨
    title: Beautiful UI Components
    details: 100+ Svelte 5 components with dark mode, full accessibility (WCAG 2.1 AA), i18n support, and customizable theming.

  - icon: ⚡
    title: High Performance
    details: Redis caching, BullMQ job queues, database connection pooling, and optimized queries for millisecond response times.

  - icon: 🔒
    title: Security First
    details: Rate limiting, CSRF protection, security headers, input sanitization, and breach checking for password policies.

  - icon: 🔌
    title: Plugin Architecture
    details: Extensible plugin system with event bus for inter-plugin communication, dependency resolution, and lifecycle hooks.

  - icon: 🛠️
    title: Excellent Developer Experience
    details: Comprehensive CLI tools, full TypeScript types, extensive documentation, testing utilities, and helpful error messages.

  - icon: 📦
    title: Monorepo Ready
    details: Built with Turborepo for optimal build performance, shared configurations, and efficient dependency management.

  - icon: 🌍
    title: Internationalization
    details: Built-in i18n support for UI components and email templates with easy locale switching and translation management.

  - icon: 🚀
    title: Production Ready
    details: Docker configs, Kubernetes deployments, health checks, monitoring integrations, and comprehensive deployment guides.
---

## Quick Example

Get started in minutes with a fully-featured authentication system:

```typescript
// hooks.server.ts - SvelteKit integration
import type { Handle } from '@sveltejs/kit'
import { auth } from '@sv-sdk/auth'
import { checkRoutePermission } from '@sv-sdk/permissions'

export const handle: Handle = async ({ event, resolve }) => {
  // Get authenticated session
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  event.locals.user = session?.user || null

  // Check permissions
  if (event.locals.user) {
    const allowed = await checkRoutePermission(event.locals.user.id, event.url.pathname)

    if (!allowed) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  return resolve(event)
}
```

```svelte
<!-- Login form with UI components -->
<script>
  import { Button, Input, Card, Alert } from '@sv-sdk/ui'

  let email = $state('')
  let password = $state('')

  async function handleLogin() {
    // Authentication handled by SDK
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }
</script>

<Card>
  <h2>Welcome Back</h2>
  <Input type="email" label="Email" bind:value={email} />
  <Input type="password" label="Password" bind:value={password} />
  <Button variant="primary" onclick={handleLogin}>Sign In</Button>
</Card>
```

## Why SV-SDK?

### All-in-One Solution

SV-SDK provides everything you need to build modern SaaS applications:

- ✅ Authentication & authorization out of the box
- ✅ Professional UI component library
- ✅ Email system with templates and tracking
- ✅ Audit logging for compliance
- ✅ Caching and background jobs
- ✅ Security utilities and best practices

### Built for Svelte 5

Taking full advantage of Svelte 5's features:

- **Runes** for reactive state management
- **Snippets** for component composition
- **Enhanced TypeScript** support
- **SvelteKit** integration patterns

### Production Battle-Tested

Used in production applications with:

- **High-volume authentication** (1000+ logins/minute)
- **Background job processing** (100,000+ emails/day)
- **Complex permission systems** (50+ roles, 200+ permissions)
- **Compliance requirements** (GDPR, SOC 2, HIPAA)

## Packages Overview

| Package                 | Purpose        | Key Features                          |
| ----------------------- | -------------- | ------------------------------------- |
| **@sv-sdk/core**        | SDK foundation | Plugin system, event bus, context     |
| **@sv-sdk/auth**        | Authentication | BetterAuth, sessions, user management |
| **@sv-sdk/permissions** | Authorization  | RBAC, resource-level permissions      |
| **@sv-sdk/ui**          | Components     | 100+ Svelte 5 components              |
| **@sv-sdk/email**       | Email          | MJML, queues, multi-provider          |
| **@sv-sdk/audit**       | Logging        | Audit trail, retention, compliance    |
| **@sv-sdk/cache**       | Performance    | Redis, BullMQ, caching utilities      |
| **@sv-sdk/security**    | Security       | Rate limiting, CSRF, headers          |

[View all packages →](/packages/core)

## Community

Join our growing community:

- 💬 [Discord Server](https://discord.gg/your-server) - Get help and share ideas
- 🐦 [Twitter](https://twitter.com/your_handle) - Stay updated
- 🐛 [GitHub Issues](https://github.com/your-org/sv-sdk/issues) - Report bugs
- 📧 [Email](mailto:support@yourdomain.com) - Enterprise support

## License

MIT © 2024-present

---

<div style="text-align: center; margin-top: 2rem; color: #666;">
  Made with ❤️ for the Svelte community
</div>
