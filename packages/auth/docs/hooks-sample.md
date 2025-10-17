# SvelteKit Integration Guide

This guide shows how to integrate @sv-sdk/auth with SvelteKit using hooks.

## Server Hooks

Create `src/hooks.server.ts` to handle authentication on the server:

```typescript
import { auth } from '@sv-sdk/auth'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

/**
 * Authentication hook
 * Checks session and attaches user to event.locals
 */
const authHook: Handle = async ({ event, resolve }) => {
  // Get session from BetterAuth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Attach to locals
  event.locals.session = session?.session ?? null
  event.locals.user = session?.user ?? null

  return resolve(event)
}

/**
 * Protected routes hook
 * Redirects unauthenticated users to login
 */
const protectedRoutesHook: Handle = async ({ event, resolve }) => {
  const { url, locals } = event

  // Define protected route patterns
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']

  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route))

  if (isProtectedRoute && !locals.user) {
    // Redirect to login with return URL
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
      },
    })
  }

  return resolve(event)
}

/**
 * Admin routes hook
 * Checks for admin role
 */
const adminRoutesHook: Handle = async ({ event, resolve }) => {
  const { url, locals } = event

  const isAdminRoute = url.pathname.startsWith('/admin')

  if (isAdminRoute) {
    if (!locals.user) {
      return new Response(null, {
        status: 302,
        headers: { location: '/login?redirect=/admin' },
      })
    }

    // Check for admin role
    const isAdmin = locals.user.role === 'admin' || locals.user.role === 'super_admin'

    if (!isAdmin) {
      return new Response(null, {
        status: 403,
        headers: { location: '/forbidden' },
      })
    }
  }

  return resolve(event)
}

// Combine hooks
export const handle = sequence(authHook, protectedRoutesHook, adminRoutesHook)
```

## App Locals Types

Add types for `event.locals` in `src/app.d.ts`:

```typescript
declare global {
  namespace App {
    interface Locals {
      user: import('@sv-sdk/auth').User | null
      session: import('@sv-sdk/auth').Session | null
    }

    interface PageData {
      user?: import('@sv-sdk/auth').User
      session?: import('@sv-sdk/auth').Session
    }
  }
}

export {}
```

## Layout Load

Create `src/routes/+layout.server.ts` to pass user data to all pages:

```typescript
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    session: locals.session,
  }
}
```

## Login Page

Example login page at `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  let email = ''
  let password = ''
  let error = ''
  let loading = false

  async function handleLogin() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        error = data.error || 'Login failed'
        return
      }

      // Redirect to return URL or dashboard
      const redirect = $page.url.searchParams.get('redirect') || '/dashboard'
      await goto(redirect)
    } catch (err) {
      error = 'Network error. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<form on:submit|preventDefault={handleLogin}>
  <h1>Login</h1>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <label>
    Email
    <input type="email" bind:value={email} required />
  </label>

  <label>
    Password
    <input type="password" bind:value={password} required />
  </label>

  <button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>

  <a href="/signup">Don't have an account? Sign up</a>
  <a href="/forgot-password">Forgot password?</a>
</form>
```

## API Route Handler

Example API route at `src/routes/api/auth/login/+server.ts`:

```typescript
import { json } from '@sveltejs/kit'
import { login } from '@sv-sdk/auth'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const body = await request.json()

  const result = await login(body, {
    ipAddress: getClientAddress(),
    userAgent: request.headers.get('user-agent') || undefined,
  })

  if (!result.success) {
    return json({ error: result.error.message }, { status: result.error.statusCode || 401 })
  }

  return json({
    success: true,
    user: result.data.user,
    session: result.data.session,
  })
}
```

## Protected Page Example

Example protected page at `src/routes/dashboard/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  $: user = data.user
</script>

{#if user}
  <h1>Welcome, {user.name || user.email}!</h1>
  <p>You are logged in as: {user.email}</p>
  <p>Role: {user.role}</p>
{:else}
  <p>Loading...</p>
{/if}
```

## Logout Button

Example logout component:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation'

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await goto('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }
</script>

<button on:click={handleLogout}>
  Logout
</button>
```

## Middleware Pattern

For API routes that require authentication:

```typescript
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for specific role
  if (locals.user.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  // User is authenticated and authorized
  return json({ data: 'Protected data' })
}
```

## Best Practices

1. **Always validate session** on protected routes
2. **Check permissions** for sensitive operations
3. **Use HTTPS** in production for secure cookies
4. **Set secure cookie options** (httpOnly, secure, sameSite)
5. **Implement CSRF protection** on state-changing operations
6. **Log authentication events** for audit trail
7. **Rate limit** authentication endpoints
8. **Handle session expiry** gracefully in UI

## Common Patterns

### Check if user is authenticated (client-side)

```svelte
<script lang="ts">
  import { page } from '$app/stores'

  $: isAuthenticated = !!$page.data.user
  $: user = $page.data.user
</script>

{#if isAuthenticated}
  <p>Welcome, {user.name}!</p>
{:else}
  <a href="/login">Login</a>
{/if}
```

### Role-based UI rendering

```svelte
<script lang="ts">
  import { page } from '$app/stores'

  $: user = $page.data.user
  $: isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
</script>

{#if isAdmin}
  <a href="/admin">Admin Panel</a>
{/if}
```

## Troubleshooting

### Session not persisting

- Check cookie settings (secure, sameSite)
- Verify BETTER_AUTH_SECRET is set
- Check baseURL matches your application URL

### Login returns 401

- Verify email and password are correct
- Check database connection
- Verify BetterAuth configuration

### CORS errors

- Add origin to CORS whitelist
- Check credentials setting in CORS config
- Verify cookies are allowed

## References

- [BetterAuth Documentation](https://www.better-auth.com/docs)
- [SvelteKit Hooks](https://kit.svelte.dev/docs/hooks)
- [SvelteKit Load Functions](https://kit.svelte.dev/docs/load)
