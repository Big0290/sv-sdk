# Authentication Package

Production-ready authentication system powered by BetterAuth with Drizzle adapter.

## Installation

```bash
pnpm add @big0290/auth
```

## Features

- Email/password authentication with Argon2 hashing
- Session management with database storage
- Password policies and strength validation
- Email verification and password reset
- Rate limiting on auth endpoints
- User CRUD operations with caching
- BetterAuth integration

## Quick Start

### Configure Environment

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sv_sdk"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="your_32_character_secret_here"
BETTER_AUTH_URL="http://localhost:5173"
SESSION_MAX_AGE=604800  # 7 days
```

### SvelteKit Integration

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { auth } from '@big0290/auth'

export const handle: Handle = async ({ event, resolve }) => {
  // Get session
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  // Attach to locals
  event.locals.user = session?.user || null
  event.locals.session = session?.session || null

  return resolve(event)
}
```

## Authentication Flows

### User Signup

```typescript
import { signup } from '@big0290/auth'

const result = await signup(
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

if (result.success) {
  const { user, session } = result.data
  console.log('User created:', user.id)
} else {
  console.error('Signup failed:', result.error)
}
```

### User Login

```typescript
import { login } from '@big0290/auth'

const result = await login(
  {
    email: 'user@example.com',
    password: 'SecurePassword123!',
  },
  {
    ipAddress: '127.0.0.1',
    userAgent: request.headers.get('user-agent'),
  }
)

if (result.success) {
  const { user, session } = result.data
  // Store session, set cookie, redirect user
} else {
  console.error('Login failed:', result.error)
  // Show error to user
}
```

### User Logout

```typescript
import { logout } from '@big0290/auth'

await logout(sessionToken)
// Session is invalidated
```

### Password Reset

```typescript
import { requestPasswordReset, resetPassword } from '@big0290/auth'

// Step 1: Request reset
await requestPasswordReset('user@example.com', {
  ipAddress: '127.0.0.1',
})
// Email sent with reset token

// Step 2: Reset password
const result = await resetPassword(token, newPassword)
if (result.success) {
  console.log('Password reset successfully')
}
```

## User Management

### Get Users

```typescript
import { getUsers } from '@big0290/auth'

const result = await getUsers(
  { role: 'admin', isActive: true }, // Filters
  { page: 1, pageSize: 20 } // Pagination
)

console.log(`Found ${result.pagination.totalCount} users`)
result.data.forEach((user) => {
  console.log(user.email, user.role)
})
```

### Get User by ID

```typescript
import { getUserById } from '@big0290/auth'

// Cached in Redis (5 min TTL)
const user = await getUserById('user-123')
if (user) {
  console.log(user.name, user.email)
}
```

### Create User

```typescript
import { createUser } from '@big0290/auth'

const user = await createUser({
  email: 'new-user@example.com',
  name: 'Jane Doe',
  role: 'user',
  isActive: true,
})
```

### Update User

```typescript
import { updateUser } from '@big0290/auth'

await updateUser('user-123', {
  name: 'John Updated',
  role: 'admin',
})
// Cache automatically invalidated
```

### Delete User

```typescript
import { deleteUser } from '@big0290/auth'

// Soft delete
await deleteUser('user-123')
```

## Session Management

### Get User Sessions

```typescript
import { getUserSessions } from '@big0290/auth'

const sessions = await getUserSessions('user-123')
sessions.forEach((session) => {
  console.log(session.ipAddress, session.userAgent, session.expiresAt)
})
```

### Revoke Session

```typescript
import { revokeSession } from '@big0290/auth'

await revokeSession('session-abc')
```

### Revoke All Sessions

```typescript
import { revokeAllUserSessions } from '@big0290/auth'

// Revoke all except current
await revokeAllUserSessions('user-123', 'current-session-id')

// Revoke all
await revokeAllUserSessions('user-123')
```

### Clean Expired Sessions

```typescript
import { cleanExpiredSessions } from '@big0290/auth'

// Run as cron job
const cleaned = await cleanExpiredSessions()
console.log(`Cleaned ${cleaned} expired sessions`)
```

## Password Policy

### Enforce Password Policy

```typescript
import { enforcePasswordPolicy } from '@big0290/auth'

try {
  await enforcePasswordPolicy('MyPassword123!')
  console.log('Password is valid')
} catch (error) {
  console.error('Password invalid:', error.message)
}
```

### Validate Password

```typescript
import { validatePassword } from '@big0290/auth'

const validation = await validatePassword('weak')

if (!validation.valid) {
  console.log('Errors:', validation.errors)
  // ["Password must be at least 12 characters", ...]
}

console.log('Strength:', validation.strength) // weak | medium | strong
console.log('Score:', validation.score) // 0-4
```

### Default Password Requirements

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not found in breach database (optional)

### Custom Password Policy

```typescript
import { configurePasswordPolicy } from '@big0290/auth'

configurePasswordPolicy({
  minLength: 16,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true,
  checkBreaches: true,
  maxLength: 128,
})
```

## Rate Limiting

Authentication endpoints are automatically rate limited:

| Endpoint       | Limit      | Window     |
| -------------- | ---------- | ---------- |
| Login          | 5 attempts | 15 minutes |
| Signup         | 3 attempts | 1 hour     |
| Password Reset | 3 attempts | 1 hour     |

Rate limits are per IP address and stored in Redis.

## API Routes (SvelteKit)

### Login Endpoint

```typescript
// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit'
import { login } from '@big0290/auth'
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
    return json({ user: result.data.user })
  } else {
    return json({ error: result.error }, { status: 401 })
  }
}
```

### Signup Endpoint

```typescript
// src/routes/api/auth/signup/+server.ts
import { json } from '@sveltejs/kit'
import { signup } from '@big0290/auth'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const body = await request.json()

  const result = await signup(body, {
    ipAddress: getClientAddress(),
  })

  if (result.success) {
    return json({ user: result.data.user })
  } else {
    return json({ error: result.error }, { status: 400 })
  }
}
```

### Logout Endpoint

```typescript
// src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit'
import { logout } from '@big0290/auth'

export const POST: RequestHandler = async ({ locals }) => {
  if (locals.session) {
    await logout(locals.session.token)
  }
  return json({ success: true })
}
```

## TypeScript Types

```typescript
import type { User, Session, AuthResult, SignupData, LoginData, PasswordValidation } from '@big0290/auth'

// User type
interface User {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Session type
interface Session {
  id: string
  token: string
  userId: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
}
```

## Security Features

- ✅ Argon2 password hashing (via BetterAuth)
- ✅ Secure session tokens in HTTP-only cookies
- ✅ Rate limiting on authentication endpoints
- ✅ Password strength validation
- ✅ Breach database checking
- ✅ Session expiry and renewal
- ✅ Email verification
- ✅ Audit logging for all auth events

## Caching

User data is cached in Redis:

- **TTL**: 5 minutes
- **Keys**: `user:{userId}`
- **Auto-invalidation**: On user updates
- **Performance**: < 5ms cache hits

## Audit Logging

All authentication events are automatically logged:

- `user.signup` - User registration
- `user.login` - Successful login
- `user.login.failed` - Failed login attempt
- `user.logout` - User logout
- `user.created` - User created by admin
- `user.updated` - User profile updated
- `user.deleted` - User deleted
- `password.changed` - Password changed
- `session.revoked` - Session manually revoked

## Future Features

- [ ] Multi-Factor Authentication (TOTP, SMS, Email)
- [ ] Social Login (Google, GitHub, Microsoft)
- [ ] Magic Links (passwordless authentication)
- [ ] Passkeys (WebAuthn support)
- [ ] Account linking
- [ ] Session device management

## Troubleshooting

### BetterAuth Not Working

- Verify `BETTER_AUTH_SECRET` is at least 32 characters
- Check `BETTER_AUTH_URL` matches your app URL
- Ensure database migrations are applied

### Sessions Not Persisting

- Check cookie settings (secure, httpOnly, sameSite)
- Verify Redis is running and accessible
- Check session expiry settings

### Password Validation Failing

- Review password requirements
- Check password strength score
- Verify breach checking is not blocking valid passwords

## Related Documentation

- [Permissions Package →](/packages/permissions)
- [Authentication Guide →](/guides/authentication)
- [API Reference →](/api/auth)
