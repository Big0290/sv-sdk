# @big0290/permissions

Role-Based Access Control (RBAC) system with Redis caching for the SV-SDK platform.

## Features

- **RBAC** - Role-based access control with resource-level permissions
- **Permission Caching** - Redis-backed caching for performance
- **Role Management** - Create, update, delete roles
- **User Role Assignment** - Assign/revoke roles from users
- **Flexible Permissions** - Format: `action:scope:resource`
- **Wildcard Permissions** - Super admin support
- **Audit Logging** - All permission changes logged
- **SvelteKit Middleware** - Route protection helpers

## Installation

```bash
pnpm add @big0290/permissions
```

## Permission Format

Permissions follow the pattern: `action:scope:resource`

**Examples**:

- `read:any:user` - Read any user
- `update:own:profile` - Update own profile
- `delete:any:email` - Delete any email
- `*:*:*` - Wildcard (all permissions)

## Usage

### Check Permission

```typescript
import { can, enforce } from '@big0290/permissions'

// Check if user has permission
const allowed = await can('user-123', 'read:any:user')

if (allowed) {
  // User can view all users
}

// Enforce permission (throws error if denied)
await enforce('user-123', 'update:any:user')
```

### Resource-Level Permissions

```typescript
import { can, type PermissionContext } from '@big0290/permissions'

// Check if user can update their own profile
const context: PermissionContext = {
  userId: 'user-123',
  resourceId: 'profile-123',
  resourceOwnerId: 'user-123', // Owner of the resource
}

const allowed = await can('user-123', 'update:own:profile', context)
// true if user-123 owns profile-123
```

### Role Management

```typescript
import { createRole, updateRole, deleteRole, getRoles } from '@big0290/permissions'
import { PERMISSIONS } from '@big0290/permissions'

// Create role
const role = await createRole({
  name: 'editor',
  description: 'Can edit content',
  permissions: [PERMISSIONS.USER_READ_ANY, PERMISSIONS.TEMPLATE_UPDATE_ANY],
  isSystem: false,
})

// Update role
await updateRole(role.id, {
  description: 'Can edit all content',
  permissions: [...role.permissions, PERMISSIONS.EMAIL_CREATE_ANY],
})

// Delete role (with user reassignment)
await deleteRole(role.id, 'user-role-id')

// Get all roles
const roles = await getRoles()
```

### User Role Assignment

```typescript
import { assignRole, revokeRole, getUserRoles } from '@big0290/permissions'

// Assign role to user
await assignRole('user-123', 'editor-role-id', 'admin-456')

// Revoke role from user
await revokeRole('user-123', 'editor-role-id')

// Get user's roles
const userRoles = await getUserRoles('user-123')
```

### Bulk Operations

```typescript
import { bulkAssignRole } from '@big0290/permissions'

// Assign role to multiple users
const assigned = await bulkAssignRole(['user-1', 'user-2', 'user-3'], 'manager-role-id', 'admin-id')

console.log(`Assigned role to ${assigned} users`)
```

### Permission Caching

Permissions are automatically cached in Redis (TTL: 5 minutes):

```typescript
import { refreshPermissionCache, invalidatePermissionCache } from '@big0290/permissions'

// Manually refresh cache
const permissions = await refreshPermissionCache('user-123')

// Invalidate cache (e.g., after role change)
await invalidatePermissionCache('user-123')
```

## Default Roles

Created by database seed:

1. **super_admin** - All permissions (`*:*:*`)
2. **admin** - Most permissions (except sensitive operations)
3. **manager** - Limited admin permissions
4. **user** - Basic permissions (own profile)

## Available Permissions

See `PERMISSIONS` constant for all available permissions:

```typescript
import { PERMISSIONS, PERMISSION_DESCRIPTIONS } from '@big0290/permissions'

PERMISSIONS.USER_READ_ANY // 'read:any:user'
PERMISSIONS.USER_UPDATE_OWN // 'update:own:user'
PERMISSIONS.ROLE_CREATE_ANY // 'create:any:role'
PERMISSIONS.EMAIL_CREATE_ANY // 'create:any:email'
PERMISSIONS.TEMPLATE_UPDATE_ANY // 'update:any:template'
PERMISSIONS.AUDIT_LOG_READ_ANY // 'read:any:audit_log'
PERMISSIONS.SYSTEM_MANAGE // 'update:any:system'

// Get description
const desc = PERMISSION_DESCRIPTIONS[PERMISSIONS.USER_READ_ANY]
// "View any user profile"
```

## SvelteKit Integration

### Protect Routes

```typescript
// src/hooks.server.ts
import { checkRoutePermission } from '@big0290/permissions'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url
  const userId = event.locals.user?.id

  // Check route permission
  const check = await checkRoutePermission(userId, pathname)

  if (!check.allowed && check.redirectTo) {
    return new Response(null, {
      status: 302,
      headers: { location: check.redirectTo },
    })
  }

  return resolve(event)
}
```

### API Route Protection

```typescript
import { enforce } from '@big0290/permissions'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Enforce permission
  await enforce(userId, 'read:any:user')

  // User has permission, proceed
  return json({ users: await getUsers() })
}
```

### Client-Side Permission Checks

```svelte
<script lang="ts">
  import { page } from '$app/stores'

  // Load user permissions in layout
  export let data

  $: userPermissions = data.permissions || []
  $: canEditUsers = userPermissions.includes('update:any:user')
  $: canDeleteUsers = userPermissions.includes('delete:any:user')
</script>

{#if canEditUsers}
  <button>Edit User</button>
{/if}

{#if canDeleteUsers}
  <button>Delete User</button>
{/if}
```

## Permission Checking Logic

1. Check for wildcard permission (`*:*:*`)
2. Check for exact permission match
3. Check for scope escalation (`any` can access `own`)
4. Check resource ownership (for `own` scope)

**Example**:

```typescript
// User has: ['update:any:user']

await can(userId, 'update:any:user') // true (exact match)
await can(userId, 'update:own:user') // true (scope escalation)
await can(userId, 'delete:any:user') // false (different action)
```

## Performance

**Permission Checks**:

- Cache hit: < 5ms
- Cache miss: < 50ms (with DB query)
- Cache hit rate: > 80%

**Caching Strategy**:

- TTL: 5 minutes
- Invalidation: On role assignment/revocation
- Fallback: Database query on cache miss

## Best Practices

1. **Use constants** - Use `PERMISSIONS` constants, not hardcoded strings
2. **Cache permissions** - Always use caching for performance
3. **Invalidate cache** - When roles change
4. **Log denials** - For security monitoring
5. **Use middleware** - Protect routes declaratively
6. **Check on server** - Never rely on client-side checks alone

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Integration

Works with:

- `@big0290/auth` - User authentication
- `@big0290/audit` - Permission event logging
- `@big0290/cache` - Redis caching
- `@big0290/db-config` - Database access

## Future Enhancements

- **Attribute-Based Access Control (ABAC)** - Context-aware permissions
- **Role Inheritance** - Hierarchical roles
- **Conditional Permissions** - Time-based, location-based
- **Permission Templates** - Reusable permission sets

## License

MIT
