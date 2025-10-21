# Demo App

User-facing demo application showcasing SV-SDK integration.

## Features

- ✅ Landing page with feature showcase
- ✅ User authentication (login, signup)
- ✅ Email verification flow
- ✅ Password reset
- ✅ Profile management
- ✅ Protected routes
- ✅ Responsive design with dark mode

## Development

```bash
# Start demo app
pnpm --filter demo-app dev

# Access at http://localhost:5174
```

## Integration Examples

This app demonstrates:

1. **@big0290/auth** integration in hooks.server.ts
2. **@big0290/ui** components throughout the app
3. **@big0290/email** for verification emails
4. **@big0290/security** for rate limiting
5. **@big0290/permissions** for protected routes

## Routes

- `/` - Landing page
- `/features` - Feature showcase
- `/login` - User login
- `/signup` - User registration
- `/profile` - User profile (protected)
- `/verify-email` - Email verification handler
- `/reset-password` - Password reset

## Testing

```bash
# E2E tests
pnpm --filter demo-app test:e2e
```
