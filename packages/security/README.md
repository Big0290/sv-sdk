# @big0290/security

Security utilities for the SV-SDK platform, including rate limiting, CSRF protection, input sanitization, and more.

## Features

- **Rate Limiting** - Redis-backed sliding window rate limiter
- **CSRF Protection** - Double-submit cookie pattern
- **Input Sanitization** - XSS, SQL injection, path traversal prevention
- **Security Headers** - CSP, HSTS, and other security headers
- **Secrets Management** - Environment variable validation, encryption utilities
- **Security Audit** - Logging for security events

## Installation

```bash
pnpm add @big0290/security
```

## Usage

### Rate Limiting

```typescript
import { checkRateLimit, enforceRateLimit, RATE_LIMITS } from '@big0290/security'

// Check rate limit
const result = await checkRateLimit({
  ...RATE_LIMITS.LOGIN,
  identifier: req.ip,
  resource: '/api/login',
})

if (!result.allowed) {
  return res.status(429).json({
    error: 'Too many requests',
    retryAfter: result.retryAfter,
  })
}

// Or enforce (throws error if exceeded)
await enforceRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  identifier: userId,
  resource: '/api/users',
})

// Add rate limit headers to response
const headers = getRateLimitHeaders(result)
res.set(headers)
```

### CSRF Protection

```typescript
import { generateCSRFToken, verifyCSRFToken, enforceCSRF } from '@big0290/security'

// Generate token (e.g., when rendering form)
const csrfToken = await generateCSRFToken({
  sessionId: session.id,
  ttl: 3600, // 1 hour
})

// Send token in cookie and hidden form field
res.cookie('csrf-token', csrfToken, CSRF_COOKIE_OPTIONS)

// Verify token on form submission
const isValid = await verifyCSRFToken(req.body.csrfToken, session.id)

// Or enforce (throws error if invalid)
await enforceCSRF(req.body.csrfToken, session.id)
```

### Input Sanitization

```typescript
import { sanitizeHtml, sanitizeUserInput, detectXSS, sanitizeUrl } from '@big0290/security'

// Sanitize HTML
const safe = sanitizeHtml(userInput)
// '<script>alert("xss")</script>' → '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

// Comprehensive sanitization
const cleaned = sanitizeUserInput(userInput, { allowHtml: false })

// Detect XSS attempts
if (detectXSS(userInput)) {
  logger.warn('XSS attempt detected')
  await logSuspiciousActivity({ type: 'xss_attempt', ipAddress: req.ip })
}

// Sanitize URL
const safeUrl = sanitizeUrl(userInput, ['http', 'https'])
```

### Security Headers

```typescript
import { getSecurityHeaders, getCORSHeaders } from '@big0290/security'

// Get all security headers
const headers = getSecurityHeaders({
  hsts: true,
  frameOptions: 'DENY',
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
    },
  },
})

// Apply to response
res.set(headers)

// CORS headers
const corsHeaders = getCORSHeaders({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  credentials: true,
})
```

### Secrets Management

```typescript
import { validateRequiredEnvVars, redactSecret, encrypt, decrypt } from '@big0290/security'

// Validate environment variables on startup
const validation = validateRequiredEnvVars()

if (!validation.valid) {
  console.error('Missing environment variables:', validation.missing)
  process.exit(1)
}

// Redact secrets in logs
const redacted = redactSecret(apiKey)
// 'sk_live_1234567890abcdef' → 'sk***ef'

// Encrypt sensitive data for database
const encrypted = encrypt(sensitiveData)
await db.insert(table).values({ encryptedField: encrypted })

// Decrypt when retrieving
const decrypted = decrypt(record.encryptedField)
```

### Security Audit Logging

```typescript
import { logSecurityEvent, logFailedLogin, logSuspiciousActivity } from '@big0290/security'

// Log failed login
await logFailedLogin({
  email: 'user@example.com',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
})

// Log suspicious activity
await logSuspiciousActivity({
  type: 'xss_attempt',
  ipAddress: req.ip,
  details: { input: userInput },
})

// Custom security event
await logSecurityEvent({
  type: 'custom_event',
  severity: 'medium',
  userId: user.id,
  ipAddress: req.ip,
  details: { action: 'sensitive_operation' },
})
```

## Pre-configured Rate Limits

```typescript
import { RATE_LIMITS } from '@big0290/security'

RATE_LIMITS.LOGIN // 5 attempts per 15 minutes
RATE_LIMITS.PASSWORD_RESET // 3 attempts per hour
RATE_LIMITS.SIGNUP // 3 attempts per hour
RATE_LIMITS.API // 100 requests per 15 minutes
RATE_LIMITS.EMAIL_SEND // 10 emails per minute
```

## Security Best Practices

1. **Always validate input** - Never trust user input
2. **Use rate limiting** - Prevent brute force and DoS attacks
3. **Enable CSRF protection** - Protect against CSRF attacks
4. **Set security headers** - Defense in depth
5. **Sanitize output** - Prevent XSS
6. **Log security events** - Monitor suspicious activity
7. **Rotate secrets** - Regularly rotate API keys and passwords
8. **Use HTTPS** - Always in production
9. **Keep dependencies updated** - Regular security patches
10. **Perform security audits** - Regular penetration testing

## Integration

Works with:

- `@big0290/cache` - Redis for rate limiting and CSRF tokens
- `@big0290/shared` - Error classes and logging
- `@big0290/audit` - Security event logging (integration pending)

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Security Checklist

See [docs/security-checklist.md](./docs/security-checklist.md) for comprehensive production security checklist.

## License

MIT
