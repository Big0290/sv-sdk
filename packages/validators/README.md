# @sv-sdk/validators

Validation schemas and DTOs for the SV-SDK platform. Built on Zod with runtime type safety.

## Features

- **DTOs** for all API operations (auth, email, audit, permissions)
- **Validation utilities** for common patterns
- **Password strength checking** with detailed feedback
- **API response types** for standardized responses
- **Type guards** for runtime type checking
- **Extends Drizzle schemas** for single source of truth

## Installation

```bash
pnpm add @sv-sdk/validators
```

## Usage

### Auth DTOs

```typescript
import { loginRequestSchema, signupRequestSchema } from '@sv-sdk/validators/auth'

// Validate login
const result = loginRequestSchema.safeParse({
  email: 'user@example.com',
  password: 'SecurePass123!',
})

// Validate signup
const signupResult = signupRequestSchema.safeParse({
  email: 'new@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  name: 'John Doe',
})
```

### Email DTOs

```typescript
import { sendEmailRequestSchema, createTemplateRequestSchema } from '@sv-sdk/validators/email'

// Validate send email
const emailResult = sendEmailRequestSchema.safeParse({
  templateName: 'verification_email',
  recipient: 'user@example.com',
  variables: { userName: 'John', verificationUrl: 'https://...' },
})
```

### Validation Utilities

```typescript
import { validateRequest, formatZodErrors } from '@sv-sdk/validators/utils'
import { loginRequestSchema } from '@sv-sdk/validators/auth'

// Validate with Result type
const result = validateRequest(loginRequestSchema, req.body)

if (!result.success) {
  return res.status(400).json({
    error: result.error.message,
    details: formatZodErrors(result.error),
  })
}

// Use validated data (type-safe)
const { email, password } = result.data
```

### Password Strength

```typescript
import { validatePasswordStrength, checkPasswordBreach } from '@sv-sdk/validators'

// Check password strength
const strength = validatePasswordStrength('MyPassword123!')
// {
//   valid: true,
//   score: 3,
//   strength: 'strong',
//   feedback: ['Password strength: strong'],
//   requirements: { minLength: true, hasUppercase: true, ... }
// }

// Check if password is in breach database
const isBreached = await checkPasswordBreach('password123')
```

### API Response Types

```typescript
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@sv-sdk/validators'

// Success response
return createSuccessResponse({ id: '123', email: 'user@example.com' }, { requestId: 'req-123' })

// Error response
return createErrorResponse('VALIDATION_ERROR', 'Invalid email format', { field: 'email', requestId: 'req-123' })
```

### Type Guards

```typescript
import { isSuccessResponse, isEmail, assertDefined } from '@sv-sdk/validators'

// Check API response type
if (isSuccessResponse(response)) {
  console.log(response.data) // Type-safe access
}

// Check if value is email
if (isEmail(input)) {
  // input is string and valid email
}

// Assert value is defined
assertDefined(value, 'Value must be provided')
// TypeScript knows value is not null/undefined after this
```

## Available DTOs

### Auth

- `loginRequestSchema` - User login
- `signupRequestSchema` - User registration
- `updateUserRequestSchema` - Update user profile
- `passwordResetRequestSchema` - Request password reset
- `passwordResetConfirmSchema` - Confirm password reset
- `changePasswordSchema` - Change password (authenticated)
- `emailVerificationSchema` - Verify email
- `resendVerificationSchema` - Resend verification

### Email

- `sendEmailRequestSchema` - Send single email
- `bulkSendEmailRequestSchema` - Send bulk emails
- `createTemplateRequestSchema` - Create email template
- `updateTemplateRequestSchema` - Update email template
- `testSendRequestSchema` - Test email sending
- `emailQuerySchema` - Query email sends
- `emailPreferencesUpdateSchema` - Update preferences
- `unsubscribeSchema` - Unsubscribe from emails

### Audit

- `logQueryRequestSchema` - Query audit logs
- `auditExportRequestSchema` - Export audit logs
- `auditRetentionUpdateSchema` - Update retention settings
- `logAuditEventSchema` - Manual audit logging

### Permissions

- `createRoleRequestSchema` - Create new role
- `updateRoleRequestSchema` - Update existing role
- `assignRoleRequestSchema` - Assign role to user
- `revokeRoleRequestSchema` - Revoke role from user
- `checkPermissionRequestSchema` - Check user permission
- `bulkAssignRolesRequestSchema` - Bulk assign roles
- `permissionQuerySchema` - Query permissions

## Validation Utilities

- `validateRequest` - Validate with Result type
- `formatZodErrors` - Format Zod errors
- `sanitizeHtml` - Prevent XSS
- `sanitizeLikeQuery` - Sanitize SQL LIKE queries
- `stripUnknownFields` - Remove unknown fields
- `createFileValidator` - File upload validation

## Built-in Validators

- `emailValidator` - Email with normalization
- `urlValidator` - URL validation
- `uuidValidator` - UUID validation
- `slugValidator` - URL-safe slug
- `phoneValidator` - Phone number
- `dateRangeValidator` - Date range
- `paginationValidator` - Pagination params
- `sortValidator` - Sort params
- `searchValidator` - Search query

## Password Requirements

Default password requirements:

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Strength levels:

- `WEAK` - Missing multiple requirements
- `MODERATE` - Meets basic requirements
- `STRONG` - Meets all requirements + length
- `VERY_STRONG` - Meets all + extra security

## Error Handling

All validators return Zod SafeParseResult or Result type:

```typescript
const result = schema.safeParse(data)

if (!result.success) {
  // Handle validation errors
  const errors = result.error.errors
}

// Or with Result type
const result = validateRequest(schema, data)

if (!result.success) {
  // result.error is ValidationError with formatted messages
}
```

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

Works seamlessly with:

- `@sv-sdk/db-config` - Extends Drizzle schemas
- `@sv-sdk/shared` - Uses Result type and error classes
- All SDK packages - Provides validation layer

## Best Practices

1. **Always validate user input** on both client and server
2. **Use validateRequest** for consistent error handling
3. **Sanitize HTML** before displaying user content
4. **Check password strength** on signup and password change
5. **Use type guards** for runtime type safety
6. **Format errors** with formatZodErrors for user-friendly messages

## License

MIT
