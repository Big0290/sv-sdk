# @big0290/auth

Authentication package for SV-SDK using BetterAuth with Drizzle adapter.

## Features

- **BetterAuth Integration** - Production-ready authentication
- **Email/Password Auth** - Secure authentication with Argon2 hashing
- **Session Management** - Database-backed sessions
- **Password Policy** - Configurable password requirements
- **Rate Limiting** - Prevent brute force attacks
- **User Management** - CRUD operations with caching
- **Email Verification** - Verify user email addresses
- **Password Reset** - Secure password reset flow

## Installation

```bash
pnpm add @big0290/auth
```

## Configuration

Set the following environment variables:

```bash
BETTER_AUTH_SECRET=your_secret_key_min_32_chars
BETTER_AUTH_URL=http://localhost:5173
SESSION_MAX_AGE=604800  # 7 days
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## Usage

### User Service

```typescript
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@big0290/auth'

// Get users with filtering and pagination
const result = await getUsers({ role: 'admin', isActive: true }, { page: 1, pageSize: 20 })

// Get user by ID (with caching)
const user = await getUserById('user-123')

// Create user
const newUser = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
})

// Update user
await updateUser('user-123', { name: 'Jane Doe' })

// Delete user (soft delete)
await deleteUser('user-123')
```

### Authentication Flows

```typescript
import { login, signup, logout, requestPasswordReset } from '@big0290/auth'

// Login
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

if (loginResult.success) {
  const { user, session } = loginResult.data
  // Store session, redirect user, etc.
}

// Signup
const signupResult = await signup(
  {
    email: 'new@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    name: 'John Doe',
  },
  {
    ipAddress: '127.0.0.1',
  }
)

// Logout
await logout(sessionToken)

// Request password reset
await requestPasswordReset('user@example.com', {
  ipAddress: '127.0.0.1',
})
```

### Password Policy

```typescript
import { enforcePasswordPolicy, validatePassword } from '@big0290/auth'

// Enforce policy (throws error if invalid)
await enforcePasswordPolicy('MyPassword123!')

// Validate without throwing
const validation = await validatePassword('weak')
// {
//   valid: false,
//   errors: ['Password must be at least 12 characters', ...],
//   strength: 'weak',
//   score: 1
// }
```

### Session Management

```typescript
import { getUserSessions, revokeSession, revokeAllUserSessions } from '@big0290/auth'

// Get all sessions for user
const sessions = await getUserSessions('user-123')

// Revoke specific session
await revokeSession('session-abc')

// Revoke all sessions except current
await revokeAllUserSessions('user-123', 'current-session-id')

// Clean expired sessions (run as cron job)
const cleanedCount = await cleanExpiredSessions()
```

### SvelteKit Integration

See [docs/hooks-sample.md](./docs/hooks-sample.md) for complete SvelteKit integration guide.

Quick example:

```typescript
// src/hooks.server.ts
import { auth } from '@big0290/auth'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  event.locals.user = session?.user ?? null
  event.locals.session = session?.session ?? null

  return resolve(event)
}
```

## Password Requirements

Default password policy:

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not found in breach database (optional)

## Rate Limiting

Authentication endpoints are rate limited:

- **Login**: 5 attempts per 15 minutes
- **Signup**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per hour per IP

## Security Features

- ✅ Argon2 password hashing (via BetterAuth)
- ✅ Session tokens in secure cookies
- ✅ Rate limiting on auth endpoints
- ✅ Password strength validation
- ✅ Breach database checking
- ✅ Session expiry and renewal
- ✅ Secure password reset flow
- ✅ Email verification

## Caching

User data is cached in Redis (TTL: 5 minutes):

- Reduces database queries
- Improves response time
- Automatically invalidated on updates

## Audit Logging

All authentication events are logged:

- User login/logout
- Failed login attempts
- User creation/updates/deletion
- Password changes
- Session revocations

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Future Features

- **Multi-Factor Authentication (MFA)** - TOTP, SMS, Email OTP
- **Social Login** - Google, GitHub, etc.
- **Magic Links** - Passwordless authentication
- **Passkeys** - WebAuthn support

See [docs/mfa.md](./docs/mfa.md) for MFA roadmap.

## Troubleshooting

### BetterAuth not working

- Verify `BETTER_AUTH_SECRET` is set (min 32 characters)
- Check `BETTER_AUTH_URL` matches your application URL
- Ensure database schemas are migrated

### Sessions not persisting

- Check cookie settings (secure, httpOnly, sameSite)
- Verify Redis is running and accessible
- Check session expiry settings

### Password validation failing

- Review password requirements
- Check password strength score
- Verify breach checking is not blocking valid passwords

## License

MIT
