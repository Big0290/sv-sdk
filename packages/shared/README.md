# @big0290/shared

Shared utilities, types, and constants for the SV-SDK platform.

## Features

- **Error Hierarchy**: Custom error classes for different failure scenarios
- **Structured Logging**: Contextual logging with PII redaction
- **Type Utilities**: Result type, pagination, filtering
- **Constants**: HTTP status codes, event types, permissions

## Installation

```bash
pnpm add @big0290/shared
```

## Usage

### Errors

```typescript
import { ValidationError, AuthenticationError, NotFoundError } from '@big0290/shared'

// Validation error
throw new ValidationError('Invalid email format', {
  field: 'email',
  errors: [{ field: 'email', message: 'Must be valid email' }],
})

// Authentication error
throw new AuthenticationError('Invalid credentials')

// Not found error
throw new NotFoundError('User not found', {
  resource: 'user',
  resourceId: '123',
})
```

### Logging

```typescript
import { logger, createLogger } from '@big0290/shared'

// Use default logger
logger.info('User logged in', { userId: '123', ip: '127.0.0.1' })
logger.error('Failed to send email', error, { userId: '123' })

// Create custom logger
const customLogger = createLogger({
  level: 'debug',
  pretty: true,
  redactKeys: ['password', 'token', 'apiKey'],
})

// Create child logger with context
const requestLogger = logger.child({
  requestId: '456',
  correlationId: '789',
})
```

### Result Type

```typescript
import { ok, err, type Result } from '@big0290/shared'

function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return err(new Error('Division by zero'))
  }
  return ok(a / b)
}

const result = divide(10, 2)
if (result.success) {
  console.log(result.data) // 5
} else {
  console.error(result.error)
}
```

### Pagination

```typescript
import { calculatePaginationMeta, calculateOffset } from '@big0290/shared'

const params = { page: 2, pageSize: 20 }
const totalCount = 100

const meta = calculatePaginationMeta(params, totalCount)
// { page: 2, pageSize: 20, totalPages: 5, totalCount: 100, hasNextPage: true, hasPreviousPage: true }

const offset = calculateOffset(params)
// 20
```

### Constants

```typescript
import { HTTP_STATUS, EVENTS, PERMISSION_ACTION } from '@big0290/shared'

// HTTP status codes
res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' })

// Event types
eventBus.emit(EVENTS.USER_LOGIN, { userId: '123' })

// Permission actions
const canEdit = checkPermission(user, PERMISSION_ACTION.UPDATE, 'user')
```

## API Reference

### Errors

- `SDKError` - Base error class
- `ValidationError` - Input validation failures
- `AuthenticationError` - Authentication failures
- `SessionError` - Session-related errors
- `AccountLockedError` - Account lock errors
- `PermissionError` - Authorization failures
- `RoleError` - Role-related errors
- `DatabaseError` - Database operation failures
- `NotFoundError` - Resource not found
- `ConstraintError` - Database constraint violations
- `ExternalServiceError` - External API failures
- `TimeoutError` - Timeout errors
- `RateLimitError` - Rate limit exceeded

### Logging

- `Logger` - Structured logger class
- `LogLevel` - Log level enum (DEBUG, INFO, WARN, ERROR)
- `logger` - Default logger instance
- `createLogger(config)` - Create custom logger

### Types

- `Result<T, E>` - Result type for operations that can fail
- `PaginationParams` - Pagination parameters
- `PaginationMeta` - Pagination metadata
- `PaginatedResponse<T>` - Paginated response structure
- `FilterCondition` - Filter condition
- `FilterOperator` - Filter operator enum
- `SortParam` - Sort parameter
- `QueryParams` - Complete query parameters

### Constants

- `HTTP_STATUS` - HTTP status codes
- `HTTP_METHOD` - HTTP methods
- `HTTP_HEADER` - Common HTTP headers
- `EVENTS` - System event types
- `PERMISSION_ACTION` - Permission actions
- `PERMISSION_RESOURCE` - Permission resources
- `PERMISSION_SCOPE` - Permission scopes

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## License

MIT
