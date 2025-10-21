# Quick Start

Build your first authenticated SvelteKit application with SV-SDK in under 5 minutes.

## Goal

By the end of this guide, you'll have a working SvelteKit app with:

- User authentication (login/signup)
- Protected routes with permissions
- Beautiful UI components
- Session management

## Step 1: Create a New SvelteKit Project

```bash
# Create new SvelteKit project
pnpm create svelte@latest my-app

# Choose these options:
# - Skeleton project
# - TypeScript syntax: Yes
# - Prettier, ESLint: Yes (recommended)

cd my-app
pnpm install
```

## Step 2: Install SV-SDK Packages

```bash
# Install core packages
pnpm add @sv-sdk/auth @sv-sdk/permissions @sv-sdk/ui @sv-sdk/shared

# Install peer dependencies
pnpm add better-auth drizzle-orm postgres
```

## Step 3: Set Up Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://sv_sdk_user:password@localhost:5432/sv_sdk"

# Redis
REDIS_URL="redis://localhost:6379"

# BetterAuth
BETTER_AUTH_SECRET="your_32_character_secret_key_here_random"
BETTER_AUTH_URL="http://localhost:5173"
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Configure Database

If you don't have a database yet, create one:

```bash
# PostgreSQL
createdb sv_sdk

# Or using psql
psql -U postgres -c "CREATE DATABASE sv_sdk;"
```

## Step 5: Set Up Authentication Hooks

Create `src/hooks.server.ts`:

```typescript
import type { Handle } from '@sveltejs/kit'
import { auth } from '@sv-sdk/auth'
import { checkRoutePermission } from '@sv-sdk/permissions'

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url

  // Get session from BetterAuth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Attach user to locals
  event.locals.user = session?.user || null
  event.locals.session = session?.session || null

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/']
  if (publicRoutes.includes(pathname)) {
    return resolve(event)
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirect=${encodeURIComponent(pathname)}`,
      },
    })
  }

  // Check permissions for protected routes
  const allowed = await checkRoutePermission(session.user.id, pathname)
  if (!allowed) {
    return new Response('Forbidden', { status: 403 })
  }

  return resolve(event)
}
```

Create `src/app.d.ts` for TypeScript types:

```typescript
import type { User, Session } from '@sv-sdk/auth'

declare global {
  namespace App {
    interface Locals {
      user: User | null
      session: Session | null
    }
  }
}

export {}
```

## Step 6: Create Login Page

Create `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
  import { Button, Input, Card, Alert } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  let email = $state('')
  let password = $state('')
  let loading = $state(false)
  let error = $state('')

  async function handleLogin() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const redirect = $page.url.searchParams.get('redirect') || '/dashboard'
        goto(redirect)
      } else {
        const data = await response.json()
        error = data.error || 'Login failed'
      }
    } catch (err) {
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="max-w-md w-full">
    <Card>
      <h1 class="text-2xl font-bold text-center mb-6">Welcome Back</h1>

      {#if error}
        <Alert variant="error" dismissible onclick={() => (error = '')}>
          {error}
        </Alert>
      {/if}

      <form
        onsubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
        class="space-y-4"
      >
        <Input type="email" label="Email" bind:value={email} required placeholder="you@example.com" />

        <Input type="password" label="Password" bind:value={password} required placeholder="••••••••" />

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?
        <a href="/signup" class="text-primary-600 hover:text-primary-700"> Sign up </a>
      </div>
    </Card>
  </div>
</div>
```

## Step 7: Create Login API Endpoint

Create `src/routes/api/auth/login/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { login } from '@sv-sdk/auth'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const { email, password } = await request.json()

  const result = await login(
    { email, password },
    {
      ipAddress: getClientAddress(),
      userAgent: request.headers.get('user-agent') || '',
    }
  )

  if (result.success) {
    return json({ success: true, user: result.data.user })
  } else {
    return json({ success: false, error: result.error }, { status: 401 })
  }
}
```

## Step 8: Create Dashboard Page

Create `src/routes/dashboard/+page.svelte`:

```svelte
<script lang="ts">
  import { Button, Card } from '@sv-sdk/ui'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <Button variant="outline" onclick={handleLogout}>Logout</Button>
    </div>

    <Card>
      <h2 class="text-xl font-semibold mb-4">Welcome, {data.user.name}!</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Email: {data.user.email}
      </p>
      <p class="text-gray-600 dark:text-gray-400">
        Role: {data.user.role}
      </p>
    </Card>
  </div>
</div>
```

Create `src/routes/dashboard/+page.server.ts`:

```typescript
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login')
  }

  return {
    user: locals.user,
  }
}
```

## Step 9: Create Logout Endpoint

Create `src/routes/api/auth/logout/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { logout } from '@sv-sdk/auth'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
  if (locals.session) {
    await logout(locals.session.token)
  }

  return json({ success: true })
}
```

## Step 10: Add UI Styles

Import UI styles in `src/routes/+layout.svelte`:

```svelte
<script>
  import '@sv-sdk/ui/styles'
</script>

<slot />
```

Configure Tailwind in `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'
import uiConfig from '@sv-sdk/ui/tailwind.config'

export default {
  ...uiConfig,
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/@sv-sdk/ui/**/*.{html,js,svelte,ts}'],
} satisfies Config
```

## Step 11: Run Your App

```bash
# Start development server
pnpm dev

# Open browser
open http://localhost:5173
```

## Step 12: Create First User

Create `src/routes/signup/+page.svelte` (similar to login):

```svelte
<script lang="ts">
  import { Button, Input, Card, Alert } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'

  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let name = $state('')
  let loading = $state(false)
  let error = $state('')

  async function handleSignup() {
    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      return
    }

    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, name }),
      })

      if (response.ok) {
        goto('/dashboard')
      } else {
        const data = await response.json()
        error = data.error || 'Signup failed'
      }
    } catch (err) {
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="max-w-md w-full">
    <Card>
      <h1 class="text-2xl font-bold text-center mb-6">Create Account</h1>

      {#if error}
        <Alert variant="error" dismissible onclick={() => (error = '')}>
          {error}
        </Alert>
      {/if}

      <form
        onsubmit={(e) => {
          e.preventDefault()
          handleSignup()
        }}
        class="space-y-4"
      >
        <Input label="Name" bind:value={name} required />
        <Input type="email" label="Email" bind:value={email} required />
        <Input type="password" label="Password" bind:value={password} required />
        <Input type="password" label="Confirm Password" bind:value={confirmPassword} required />

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <a href="/login" class="text-primary-600 hover:text-primary-700"> Sign in </a>
      </div>
    </Card>
  </div>
</div>
```

Create signup endpoint `src/routes/api/auth/signup/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { signup } from '@sv-sdk/auth'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const body = await request.json()

  const result = await signup(body, {
    ipAddress: getClientAddress(),
  })

  if (result.success) {
    return json({ success: true, user: result.data.user })
  } else {
    return json({ success: false, error: result.error }, { status: 400 })
  }
}
```

## Testing Your App

1. **Visit signup page**: http://localhost:5173/signup
2. **Create an account** with your email and password
3. **You'll be redirected** to the dashboard
4. **Try logging out** and logging back in
5. **Try accessing /dashboard** without being logged in (you'll be redirected to login)

## What You've Built

Congratulations! You now have:

- ✅ User authentication with email/password
- ✅ Session management with BetterAuth
- ✅ Protected routes with middleware
- ✅ Beautiful UI with @sv-sdk/ui components
- ✅ Login and signup flows
- ✅ Dashboard with user info

## Next Steps

Now that you have the basics working, explore more features:

### Add Permissions

```typescript
import { can } from '@sv-sdk/permissions'

// Check if user has permission
const canEditUsers = await can(locals.user.id, 'update:any:user')
```

[Learn more about permissions →](/guides/permissions)

### Send Emails

```typescript
import { sendEmail } from '@sv-sdk/email'

await sendEmail('verification_email', user.email, {
  userName: user.name,
  verificationUrl: `${url}/verify?token=${token}`,
})
```

[Learn more about emails →](/guides/email-setup)

### Add Audit Logging

```typescript
import { logAudit } from '@sv-sdk/audit'

await logAudit('user.login', {
  userId: user.id,
  ipAddress: getClientAddress(),
})
```

[Learn more about auditing →](/packages/audit)

### Explore UI Components

```svelte
import {(Button, Input, Card, Alert, Modal, Table, Dropdown, Badge, Toast)} from '@sv-sdk/ui'
```

[Browse all components →](/packages/ui)

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running and DATABASE_URL is correct:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Redis Connection Error

Check Redis is running:

```bash
redis-cli ping  # Should return: PONG
```

### BetterAuth Error

Verify BETTER_AUTH_SECRET is set and at least 32 characters long.

### UI Components Not Styled

Make sure you've:

1. Imported `@sv-sdk/ui/styles` in your layout
2. Configured Tailwind to include `@sv-sdk/ui` in content paths

## Get Help

- [Full Documentation](/getting-started/introduction)
- [Discord Community](https://discord.gg/your-server)
- [GitHub Issues](https://github.com/your-org/sv-sdk/issues)
