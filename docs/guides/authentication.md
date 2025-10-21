# Authentication Guide

Complete guide to implementing authentication in your SvelteKit application with SV-SDK.

## Overview

This guide covers:

- Setting up authentication
- Implementing login and signup
- Protecting routes
- Managing sessions
- Password policies
- Email verification
- Password reset flows

## Prerequisites

- SvelteKit project created
- PostgreSQL database running
- Redis instance running
- Environment variables configured

## 1. Installation

```bash
pnpm add @sv-sdk/auth @sv-sdk/permissions
```

## 2. Environment Configuration

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sv_sdk"

# Redis
REDIS_URL="redis://localhost:6379"

# BetterAuth
BETTER_AUTH_SECRET="your_secret_at_least_32_characters_long"
BETTER_AUTH_URL="http://localhost:5173"
SESSION_MAX_AGE=604800  # 7 days

# Optional: Password Policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_CHECK_BREACHES=true
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. Database Setup

Run migrations:

```bash
pnpm db:migrate
pnpm db:seed  # Creates default roles
```

## 4. Configure Authentication Hooks

Create `src/hooks.server.ts`:

```typescript
import type { Handle } from '@sveltejs/kit'
import { auth } from '@sv-sdk/auth'
import { checkRoutePermission } from '@sv-sdk/permissions'
import { logAudit } from '@sv-sdk/audit'

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url
  const ipAddress = event.getClientAddress()

  // Get session from BetterAuth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Attach user and session to event.locals
  event.locals.user = session?.user || null
  event.locals.session = session?.session || null

  // Public routes (no authentication required)
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/health']

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return resolve(event)
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    // API endpoints return 401
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Page routes redirect to login
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirect=${encodeURIComponent(pathname)}`,
      },
    })
  }

  // Check permissions for protected routes
  const routeCheck = await checkRoutePermission(session.user.id, pathname)

  if (!routeCheck.allowed) {
    // Log unauthorized access attempt
    await logAudit('unauthorized_access', {
      userId: session.user.id,
      pathname,
      ipAddress,
    })

    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(null, {
      status: 302,
      headers: { location: '/forbidden' },
    })
  }

  return resolve(event)
}
```

Update `src/app.d.ts` for TypeScript:

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

## 5. Create Login Page

`src/routes/login/+page.svelte`:

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
    if (!email || !password) {
      error = 'Please fill in all fields'
      return
    }

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
        error = data.error || 'Login failed. Please check your credentials.'
      }
    } catch (err) {
      error = 'An error occurred. Please try again.'
      console.error('Login error:', err)
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
  <div class="max-w-md w-full">
    <Card>
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Welcome Back</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
      </div>

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
        <Input
          type="email"
          label="Email"
          bind:value={email}
          placeholder="you@example.com"
          required
          autocomplete="email"
          disabled={loading}
        />

        <Input
          type="password"
          label="Password"
          bind:value={password}
          placeholder="••••••••"
          required
          autocomplete="current-password"
          disabled={loading}
        />

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center">
            <input type="checkbox" class="mr-2" />
            Remember me
          </label>
          <a href="/forgot-password" class="text-primary-600 hover:text-primary-700"> Forgot password? </a>
        </div>

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?
        <a href="/signup" class="text-primary-600 hover:text-primary-700 font-medium"> Sign up </a>
      </div>
    </Card>
  </div>
</div>
```

## 6. Create Signup Page

`src/routes/signup/+page.svelte`:

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
  let passwordErrors = $state<string[]>([])

  async function validatePasswordStrength() {
    if (password.length < 8) {
      passwordErrors = []
      return
    }

    const response = await fetch('/api/auth/validate-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()
    passwordErrors = data.errors || []
  }

  async function handleSignup() {
    error = ''

    if (!email || !password || !name) {
      error = 'Please fill in all fields'
      return
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      return
    }

    if (passwordErrors.length > 0) {
      error = 'Please fix password errors'
      return
    }

    loading = true

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
        error = data.error || 'Signup failed. Please try again.'
      }
    } catch (err) {
      error = 'An error occurred. Please try again.'
      console.error('Signup error:', err)
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Sign Up</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
  <div class="max-w-md w-full">
    <Card>
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Create Account</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Get started with your account</p>
      </div>

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
        <Input type="text" label="Full Name" bind:value={name} placeholder="John Doe" required disabled={loading} />

        <Input
          type="email"
          label="Email"
          bind:value={email}
          placeholder="you@example.com"
          required
          autocomplete="email"
          disabled={loading}
        />

        <Input
          type="password"
          label="Password"
          bind:value={password}
          placeholder="••••••••"
          required
          autocomplete="new-password"
          disabled={loading}
          onblur={validatePasswordStrength}
        />

        {#if passwordErrors.length > 0}
          <div class="text-sm text-red-600">
            <ul class="list-disc list-inside">
              {#each passwordErrors as err}
                <li>{err}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <Input
          type="password"
          label="Confirm Password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          required
          autocomplete="new-password"
          disabled={loading}
        />

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <a href="/login" class="text-primary-600 hover:text-primary-700 font-medium"> Sign in </a>
      </div>
    </Card>
  </div>
</div>
```

## 7. API Endpoints

### Login API

`src/routes/api/auth/login/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { login } from '@sv-sdk/auth'
import { logAudit } from '@sv-sdk/audit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const { email, password } = await request.json()
  const ipAddress = getClientAddress()
  const userAgent = request.headers.get('user-agent') || ''

  const result = await login({ email, password }, { ipAddress, userAgent })

  if (result.success) {
    await logAudit('user.login', {
      userId: result.data.user.id,
      ipAddress,
      success: true,
    })

    return json({ user: result.data.user })
  } else {
    await logAudit('user.login.failed', {
      email,
      ipAddress,
      reason: result.error,
    })

    return json({ error: result.error }, { status: 401 })
  }
}
```

### Signup API

`src/routes/api/auth/signup/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { signup } from '@sv-sdk/auth'
import { sendEmail } from '@sv-sdk/email'
import { logAudit } from '@sv-sdk/audit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const body = await request.json()
  const ipAddress = getClientAddress()

  const result = await signup(body, { ipAddress })

  if (result.success) {
    const { user } = result.data

    // Send welcome email
    await sendEmail('verification_email', user.email, {
      userName: user.name || user.email,
      verificationUrl: `${process.env.BETTER_AUTH_URL}/verify-email?token=${user.verificationToken}`,
    })

    await logAudit('user.signup', {
      userId: user.id,
      ipAddress,
    })

    return json({ user })
  } else {
    return json({ error: result.error }, { status: 400 })
  }
}
```

### Logout API

`src/routes/api/auth/logout/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { logout } from '@sv-sdk/auth'
import { logAudit } from '@sv-sdk/audit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, getClientAddress }) => {
  if (locals.user && locals.session) {
    await logout(locals.session.token)

    await logAudit('user.logout', {
      userId: locals.user.id,
      ipAddress: getClientAddress(),
    })
  }

  return json({ success: true })
}
```

## 8. Password Reset Flow

### Forgot Password Page

`src/routes/forgot-password/+page.svelte`:

```svelte
<script lang="ts">
  import { Button, Input, Card, Alert } from '@sv-sdk/ui'

  let email = $state('')
  let loading = $state(false)
  let success = $state(false)
  let error = $state('')

  async function handleReset() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        success = true
      } else {
        const data = await response.json()
        error = data.error || 'Failed to send reset email'
      }
    } catch (err) {
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
  <div class="max-w-md w-full">
    <Card>
      <h1 class="text-2xl font-bold mb-6">Reset Password</h1>

      {#if success}
        <Alert variant="success">Password reset email sent! Check your inbox for instructions.</Alert>
      {:else}
        {#if error}
          <Alert variant="error" dismissible onclick={() => (error = '')}>
            {error}
          </Alert>
        {/if}

        <form
          onsubmit={(e) => {
            e.preventDefault()
            handleReset()
          }}
          class="space-y-4"
        >
          <Input
            type="email"
            label="Email"
            bind:value={email}
            placeholder="you@example.com"
            required
            disabled={loading}
          />

          <Button type="submit" variant="primary" fullWidth {loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      {/if}

      <div class="mt-6 text-center">
        <a href="/login" class="text-primary-600 hover:text-primary-700"> Back to login </a>
      </div>
    </Card>
  </div>
</div>
```

## 9. Protected Dashboard

`src/routes/dashboard/+page.svelte`:

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
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {data.user.name}!
        </p>
      </div>
      <Button variant="outline" onclick={handleLogout}>Logout</Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <h3 class="font-semibold mb-2">Profile</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Email: {data.user.email}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Role: {data.user.role}
        </p>
      </Card>

      <!-- Add more dashboard content -->
    </div>
  </div>
</div>
```

`src/routes/dashboard/+page.server.ts`:

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

## 10. Testing Authentication

```bash
# Start your app
pnpm dev

# Test the flow:
# 1. Visit http://localhost:5173/signup
# 2. Create an account
# 3. You'll be redirected to dashboard
# 4. Try logging out and logging back in
# 5. Try accessing dashboard without logging in (should redirect)
```

## Best Practices

1. **Always use HTTPS in production**
2. **Implement rate limiting** (built-in)
3. **Log authentication events** for security monitoring
4. **Use strong password policies**
5. **Implement email verification**
6. **Set appropriate session timeouts**
7. **Handle logout on all devices** when password changes
8. **Monitor failed login attempts**

## Security Checklist

- ✅ HTTPS enabled in production
- ✅ Secure session cookies (httpOnly, secure, sameSite)
- ✅ Rate limiting on auth endpoints
- ✅ Password strength requirements
- ✅ Audit logging for auth events
- ✅ CSRF protection
- ✅ Email verification
- ✅ Session expiry
- ✅ Secure password reset flow

## Next Steps

- [Permissions Guide →](/guides/permissions)
- [Email Setup →](/guides/email-setup)
- [Deployment →](/guides/deployment)
