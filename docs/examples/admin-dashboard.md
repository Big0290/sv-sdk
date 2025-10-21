# Admin Dashboard Example

Learn how to build a full-featured admin dashboard using SV-SDK by examining the included admin app.

## Overview

The `apps/admin` demonstrates a complete admin dashboard with:

- User management (CRUD operations)
- Role and permission management
- Email template management
- Audit log viewer
- System health monitoring
- Real-time notifications

## Project Structure

```
apps/admin/
├── src/
│   ├── hooks.server.ts          # Auth & permissions middleware
│   ├── routes/
│   │   ├── +layout.svelte       # Main layout with sidebar
│   │   ├── +layout.server.ts    # Load user data
│   │   ├── login/               # Login page
│   │   ├── dashboard/           # Dashboard home
│   │   ├── users/               # User management
│   │   │   ├── +page.svelte     # User list
│   │   │   ├── [id]/            # User details
│   │   │   └── new/             # Create user
│   │   ├── roles/               # Role management
│   │   ├── emails/              # Email templates
│   │   ├── audit/               # Audit logs
│   │   └── settings/            # System settings
│   └── lib/
│       └── components/          # Reusable components
└── static/                       # Static assets
```

## Authentication Setup

The authentication is configured in `hooks.server.ts`:

```typescript
import type { Handle } from '@sveltejs/kit'
import { auth } from '@big0290/auth'
import { checkRoutePermission } from '@big0290/permissions'
import { rateLimiter } from '@big0290/security'
import { logAudit } from '@big0290/audit'

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url
  const ipAddress = event.getClientAddress()

  // Get session
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  event.locals.user = session?.user || null
  event.locals.session = session || null

  // Rate limiting on API
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
  const publicRoutes = ['/login', '/health']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return resolve(event)
  }

  // Require authentication
  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

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
    await logAudit('admin.unauthorized_access', {
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

  // Log admin actions
  if (event.request.method !== 'GET') {
    await logAudit('admin.action', {
      userId: session.user.id,
      action: event.request.method,
      pathname,
      ipAddress,
    })
  }

  return resolve(event)
}
```

## Main Layout

The admin layout provides consistent structure:

```svelte
<!-- routes/+layout.svelte -->
<script lang="ts">
  import { Sidebar, Navbar, Toast } from '@big0290/ui'
  import { page } from '$app/stores'

  let { data, children } = $props()

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'users', label: 'Users', href: '/users' },
    { icon: 'shield', label: 'Roles', href: '/roles' },
    { icon: 'mail', label: 'Emails', href: '/emails' },
    { icon: 'file-text', label: 'Audit Logs', href: '/audit' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
  ]

  $: currentPath = $page.url.pathname
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Sidebar -->
  <Sidebar items={menuItems} {currentPath} />

  <!-- Main Content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Top Navbar -->
    <Navbar user={data.user} />

    <!-- Page Content -->
    <main class="flex-1 overflow-y-auto p-6">
      {@render children()}
    </main>
  </div>
</div>

<!-- Toast Notifications -->
<Toast />
```

## User Management

### User List Page

```svelte
<!-- routes/users/+page.svelte -->
<script lang="ts">
  import { Button, Table, Input, Badge, Dropdown } from '@big0290/ui'
  import { goto } from '$app/navigation'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let searchTerm = $state('')
  let selectedRole = $state('all')

  $: filteredUsers = data.users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return

    const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (response.ok) {
      // Refresh page
      window.location.reload()
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-3xl font-bold">Users</h1>
    <Button variant="primary" onclick={() => goto('/users/new')}>Add User</Button>
  </div>

  <div class="flex gap-4">
    <Input type="search" placeholder="Search users..." bind:value={searchTerm} class="flex-1" />

    <Dropdown
      label="Filter by role"
      bind:value={selectedRole}
      options={[
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'User' },
      ]}
    />
  </div>

  <Table
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' },
    ]}
    data={filteredUsers}
  >
    {#snippet row(user)}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
            {user.role}
          </Badge>
        </td>
        <td>
          <Badge variant={user.isActive ? 'success' : 'danger'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </td>
        <td>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" onclick={() => goto(`/users/${user.id}`)}>Edit</Button>
            <Button size="sm" variant="danger" onclick={() => deleteUser(user.id)}>Delete</Button>
          </div>
        </td>
      </tr>
    {/snippet}
  </Table>
</div>
```

### User List Server Load

```typescript
// routes/users/+page.server.ts
import { getUsers } from '@big0290/auth'
import { can } from '@big0290/permissions'
import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  // Check permission
  const allowed = await can(locals.user!.id, 'read:any:user')
  if (!allowed) {
    throw error(403, 'You do not have permission to view users')
  }

  // Get all users
  const result = await getUsers({}, { page: 1, pageSize: 100 })

  return {
    users: result.data,
  }
}
```

### Create User Page

```svelte
<!-- routes/users/new/+page.svelte -->
<script lang="ts">
  import { Button, Input, Select, Card, Alert } from '@big0290/ui'
  import { goto } from '$app/navigation'

  let email = $state('')
  let name = $state('')
  let role = $state('user')
  let loading = $state(false)
  let error = $state('')

  async function handleSubmit() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      })

      if (response.ok) {
        goto('/users')
      } else {
        const data = await response.json()
        error = data.error || 'Failed to create user'
      }
    } catch (err) {
      error = 'An error occurred'
    } finally {
      loading = false
    }
  }
</script>

<div class="max-w-2xl">
  <h1 class="text-3xl font-bold mb-6">Create User</h1>

  <Card>
    {#if error}
      <Alert variant="error" dismissible onclick={() => (error = '')}>
        {error}
      </Alert>
    {/if}

    <form
      onsubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      class="space-y-4"
    >
      <Input type="text" label="Full Name" bind:value={name} required disabled={loading} />

      <Input type="email" label="Email" bind:value={email} required disabled={loading} />

      <Select
        label="Role"
        bind:value={role}
        options={[
          { value: 'user', label: 'User' },
          { value: 'manager', label: 'Manager' },
          { value: 'admin', label: 'Admin' },
        ]}
        disabled={loading}
      />

      <div class="flex gap-2">
        <Button type="submit" variant="primary" {loading}>Create User</Button>
        <Button type="button" variant="outline" onclick={() => goto('/users')}>Cancel</Button>
      </div>
    </form>
  </Card>
</div>
```

## Audit Log Viewer

```svelte
<!-- routes/audit/+page.svelte -->
<script lang="ts">
  import { Table, Input, Badge, Card } from '@big0290/ui'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let searchTerm = $state('')

  $: filteredLogs = data.logs.filter(
    (log) => log.event.toLowerCase().includes(searchTerm.toLowerCase()) || log.userId?.includes(searchTerm)
  )

  function getEventBadgeVariant(event: string) {
    if (event.includes('failed') || event.includes('error')) return 'danger'
    if (event.includes('created') || event.includes('success')) return 'success'
    if (event.includes('updated')) return 'warning'
    return 'default'
  }
</script>

<div class="space-y-6">
  <h1 class="text-3xl font-bold">Audit Logs</h1>

  <Input type="search" placeholder="Search logs..." bind:value={searchTerm} />

  <Table
    columns={[
      { key: 'timestamp', label: 'Time' },
      { key: 'event', label: 'Event' },
      { key: 'user', label: 'User' },
      { key: 'ip', label: 'IP Address' },
      { key: 'details', label: 'Details' },
    ]}
    data={filteredLogs}
  >
    {#snippet row(log)}
      <tr>
        <td class="text-sm">{new Date(log.timestamp).toLocaleString()}</td>
        <td>
          <Badge variant={getEventBadgeVariant(log.event)}>
            {log.event}
          </Badge>
        </td>
        <td>{log.userId || 'System'}</td>
        <td class="text-sm text-gray-600">{log.ipAddress || '-'}</td>
        <td class="text-sm">{JSON.stringify(log.metadata, null, 2)}</td>
      </tr>
    {/snippet}
  </Table>
</div>
```

## Real-Time Dashboard

```svelte
<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { Card, Badge, Spinner } from '@big0290/ui'
  import { onMount } from 'svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let stats = $state(data.stats)
  let loading = $state(false)

  async function refreshStats() {
    loading = true
    const response = await fetch('/api/stats')
    stats = await response.json()
    loading = false
  }

  // Refresh every 30 seconds
  onMount(() => {
    const interval = setInterval(refreshStats, 30000)
    return () => clearInterval(interval)
  })
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    {#if loading}
      <Spinner size="sm" />
    {/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
      <div class="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
      <div class="text-3xl font-bold mt-2">{stats.totalUsers}</div>
      <Badge variant="success" class="mt-2">
        +{stats.newUsersToday} today
      </Badge>
    </Card>

    <Card>
      <div class="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
      <div class="text-3xl font-bold mt-2">{stats.activeSessions}</div>
    </Card>

    <Card>
      <div class="text-sm text-gray-600 dark:text-gray-400">Emails Sent</div>
      <div class="text-3xl font-bold mt-2">{stats.emailsSent}</div>
      <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {stats.emailDeliveryRate}% delivery rate
      </div>
    </Card>

    <Card>
      <div class="text-sm text-gray-600 dark:text-gray-400">System Health</div>
      <div class="flex items-center gap-2 mt-2">
        <Badge variant={stats.systemHealth === 'healthy' ? 'success' : 'danger'}>
          {stats.systemHealth}
        </Badge>
      </div>
    </Card>
  </div>

  <!-- Recent Activity -->
  <Card>
    <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
    <div class="space-y-3">
      {#each stats.recentActivity as activity}
        <div class="flex items-start gap-3 pb-3 border-b last:border-0">
          <Badge variant="default">{activity.type}</Badge>
          <div class="flex-1">
            <p class="text-sm">{activity.message}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </Card>
</div>
```

## Key Takeaways

1. **Authentication** - hooks.server.ts handles all auth and permissions
2. **Layout** - Consistent sidebar and navbar for all admin pages
3. **Permissions** - Every route checks permissions before loading
4. **Audit Logging** - All admin actions are logged automatically
5. **UI Components** - @big0290/ui components for consistent design
6. **Real-time** - Dashboard updates automatically
7. **Type Safety** - Full TypeScript throughout

## Running the Admin App

```bash
# From project root
pnpm --filter @big0290/admin dev

# Visit http://localhost:5173
```

## Extending the Admin Dashboard

Add your own admin pages:

1. Create route in `src/routes/`
2. Add permission check in server load
3. Use UI components for consistency
4. Add audit logging for actions
5. Add menu item to sidebar

## Related Examples

- [User Management →](/examples/user-management)
- [Email Workflows →](/examples/email-workflows)
- [Protected Routes →](/examples/protected-routes)
