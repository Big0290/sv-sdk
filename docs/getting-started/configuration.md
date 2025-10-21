# Configuration

Learn how to configure SV-SDK for your specific needs.

## Configuration File

SV-SDK can be configured using a JSON configuration file or environment variables. The configuration file is optional but recommended for complex setups.

### Create Configuration File

Create `sdk.config.json` in your project root:

```json
{
  "database": {
    "url": "postgresql://sv_sdk_user:password@localhost:5432/sv_sdk",
    "pool": {
      "max": 20,
      "min": 5,
      "idleTimeoutMillis": 30000,
      "connectionTimeoutMillis": 2000
    }
  },
  "redis": {
    "url": "redis://localhost:6379",
    "maxRetriesPerRequest": 3,
    "enableReadyCheck": true
  },
  "auth": {
    "sessionTimeout": 43200,
    "maxLoginAttempts": 5,
    "lockoutDuration": 900,
    "passwordPolicy": {
      "minLength": 12,
      "requireNumbers": true,
      "requireSpecialChars": true,
      "requireUppercase": true,
      "requireLowercase": true,
      "checkBreaches": true
    }
  },
  "email": {
    "provider": "brevo",
    "from": "noreply@example.com",
    "queue": {
      "concurrency": 5,
      "retries": 3,
      "backoff": {
        "type": "exponential",
        "delay": 1000
      }
    }
  },
  "audit": {
    "retentionDays": 365,
    "maskPII": true,
    "batchSize": 100,
    "enableIntegrityCheck": true
  },
  "security": {
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 900000
    },
    "csrf": {
      "enabled": true,
      "cookieName": "_csrf"
    },
    "headers": {
      "enableHSTS": true,
      "enableCSP": true
    }
  },
  "observability": {
    "healthCheck": {
      "enabled": true,
      "interval": 30000
    },
    "metrics": {
      "enabled": true,
      "port": 9090
    }
  }
}
```

## Environment Variables

Environment variables take precedence over configuration file settings.

### Core Configuration

```bash
# Application
NODE_ENV=development  # development | production | test
PORT=5173
LOG_LEVEL=info  # debug | info | warn | error

# Base URL (required for email links, OAuth callbacks)
BETTER_AUTH_URL=http://localhost:5173
```

### Database Configuration

```bash
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host:port/database"

# SSL Configuration (production)
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true

# Connection Pool
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

**Connection String Format:**

```
postgresql://[user[:password]@][host][:port][/database][?param=value]
```

**Example with SSL:**

```bash
DATABASE_URL="postgresql://user:pass@host.com:5432/db?sslmode=require"
```

### Redis Configuration

```bash
# Redis Connection
REDIS_URL="redis://localhost:6379"

# With Password
REDIS_URL="redis://:password@localhost:6379"

# With TLS (production)
REDIS_URL="rediss://username:password@host:6380"

# Redis Options
REDIS_MAX_RETRIES=3
REDIS_ENABLE_READY_CHECK=true
```

### Authentication Configuration

```bash
# BetterAuth (required)
BETTER_AUTH_SECRET="your_secret_key_at_least_32_characters_long"
BETTER_AUTH_URL="http://localhost:5173"

# Session
SESSION_MAX_AGE=604800  # 7 days in seconds
SESSION_COOKIE_NAME="session"
SESSION_SECURE=true  # Require HTTPS (production)

# Password Policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_CHECK_BREACHES=true

# Rate Limiting (auth endpoints)
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=900  # 15 minutes
```

**Generate Secure Secret:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Email Configuration

```bash
# Provider Selection
EMAIL_PROVIDER=brevo  # brevo | ses | mock
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_REPLY_TO="support@yourdomain.com"

# Brevo Configuration
BREVO_API_KEY="your_api_key"
BREVO_WEBHOOK_SECRET="your_webhook_secret"

# AWS SES Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_SES_CONFIGURATION_SET="your_config_set"

# Queue Configuration
EMAIL_QUEUE_CONCURRENCY=5
EMAIL_QUEUE_RETRIES=3
```

### Audit Configuration

```bash
# Retention
AUDIT_RETENTION_DAYS=365
AUDIT_ARCHIVE_TO_S3=false

# PII Masking
AUDIT_MASK_PII=true
AUDIT_PII_FIELDS="email,ip_address,user_agent"

# Batch Processing
AUDIT_BATCH_SIZE=100
AUDIT_FLUSH_INTERVAL=5000  # ms

# Integrity
AUDIT_ENABLE_INTEGRITY_CHECK=true
```

### Security Configuration

```bash
# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# CSRF Protection
CSRF_ENABLED=true
CSRF_COOKIE_NAME="_csrf"
CSRF_HEADER_NAME="x-csrf-token"

# Security Headers
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'unsafe-inline'"
```

### Observability Configuration

```bash
# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000  # ms

# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090

# Sentry Integration (optional)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Per-Package Configuration

### Core SDK

```typescript
import { createSDK } from '@big0290/core'

const sdk = await createSDK({
  config: {
    name: 'my-app',
    version: '1.0.0',
    env: 'development',
    baseUrl: 'http://localhost:5173',
    debug: true,
  },
  plugins: [
    // Add plugins
  ],
})
```

### Authentication

```typescript
import { configureAuth } from '@big0290/auth'

configureAuth({
  sessionTimeout: 7 * 24 * 60 * 60, // 7 days
  maxLoginAttempts: 5,
  passwordPolicy: {
    minLength: 12,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
  },
})
```

### Permissions

```typescript
import { configurePermissions } from '@big0290/permissions'

configurePermissions({
  cacheTTL: 300, // 5 minutes
  enableCaching: true,
  defaultRole: 'user',
})
```

### Email

```typescript
import { configureEmail } from '@big0290/email'

configureEmail({
  provider: 'brevo',
  from: 'noreply@example.com',
  queue: {
    concurrency: 5,
    retries: 3,
  },
  templates: {
    directory: './email-templates',
  },
})
```

## Environment-Specific Configuration

### Development

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug

DATABASE_URL="postgresql://dev:dev@localhost:5432/sv_sdk_dev"
REDIS_URL="redis://localhost:6379"

BETTER_AUTH_URL="http://localhost:5173"
EMAIL_PROVIDER=mock  # Use mock provider for development

# Disable security features for easier development
CSRF_ENABLED=false
RATE_LIMIT_ENABLED=false
```

### Production

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info

# Use managed services
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/sv_sdk?sslmode=require"
REDIS_URL="rediss://user:pass@prod-redis.example.com:6380"

# Secure settings
BETTER_AUTH_SECRET="<generated-secret-32-chars-or-more>"
BETTER_AUTH_URL="https://app.yourdomain.com"
SESSION_SECURE=true

# Email with real provider
EMAIL_PROVIDER=brevo
BREVO_API_KEY="<your-api-key>"

# Enable all security features
CSRF_ENABLED=true
RATE_LIMIT_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# Monitoring
SENTRY_DSN="<your-sentry-dsn>"
METRICS_ENABLED=true
```

### Testing

```bash
# .env.test
NODE_ENV=test
LOG_LEVEL=error

DATABASE_URL="postgresql://test:test@localhost:5432/sv_sdk_test"
REDIS_URL="redis://localhost:6379/1"  # Use different Redis DB

BETTER_AUTH_SECRET="test_secret_32_characters_long_key"
BETTER_AUTH_URL="http://localhost:5173"

EMAIL_PROVIDER=mock
AUDIT_ENABLED=false
```

## Loading Configuration

### Automatic Loading

SV-SDK automatically loads configuration from:

1. `sdk.config.json` in project root
2. Environment variables (override config file)
3. `.env` files (loaded by dotenv)

### Priority Order (highest to lowest)

1. Environment variables
2. `sdk.config.json`
3. Package defaults

### Manual Loading

```typescript
import { loadConfig } from '@big0290/shared'

const config = await loadConfig({
  configPath: './custom-config.json',
  envPath: './.env.custom',
})
```

## Configuration Validation

SV-SDK validates configuration on startup:

```typescript
import { validateConfig } from '@big0290/shared'

try {
  validateConfig(config)
  console.log('Configuration is valid')
} catch (error) {
  console.error('Invalid configuration:', error.message)
}
```

**Common Validation Errors:**

- Missing required variables (DATABASE_URL, BETTER_AUTH_SECRET)
- Invalid formats (malformed URLs, invalid JSON)
- Out-of-range values (negative timeouts, invalid pool sizes)
- Incompatible options (conflicting security settings)

## Best Practices

### 1. Use Environment Variables for Secrets

Never commit secrets to version control:

```bash
# ❌ Don't do this
BETTER_AUTH_SECRET="my-secret-key"  # in git

# ✅ Do this
BETTER_AUTH_SECRET="${AUTH_SECRET}"  # reference external secret
```

### 2. Separate Configs per Environment

```bash
.env.development
.env.production
.env.test
```

Load the appropriate file:

```bash
NODE_ENV=production node --env-file=.env.production app.js
```

### 3. Validate on Startup

```typescript
// Check required variables on startup
const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'REDIS_URL']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}
```

### 4. Use Configuration Service

```typescript
import { ConfigService } from '@big0290/shared'

const config = ConfigService.getInstance()

// Type-safe access
const dbUrl = config.get<string>('database.url')
const sessionTimeout = config.get<number>('auth.sessionTimeout')
```

### 5. Document Your Configuration

Create a `CONFIG.md` in your project:

```markdown
# Configuration Guide

## Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for authentication (min 32 chars)

## Optional Variables

- `LOG_LEVEL`: Logging verbosity (default: info)
- `PORT`: Server port (default: 5173)
```

## Configuration Examples

### Minimal Configuration

```bash
# Minimum required for development
DATABASE_URL="postgresql://localhost/sv_sdk"
REDIS_URL="redis://localhost"
BETTER_AUTH_SECRET="dev_secret_at_least_32_chars_long"
BETTER_AUTH_URL="http://localhost:5173"
```

### Production Configuration

```bash
# Production-ready configuration
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod.db.com:5432/sv_sdk?sslmode=require"
REDIS_URL="rediss://user:pass@prod.redis.com:6380"
BETTER_AUTH_SECRET="${SECRET_FROM_VAULT}"
BETTER_AUTH_URL="https://app.example.com"
SESSION_SECURE=true
EMAIL_PROVIDER=brevo
BREVO_API_KEY="${BREVO_KEY}"
SENTRY_DSN="${SENTRY_DSN}"
METRICS_ENABLED=true
```

### Docker Compose

```yaml
services:
  app:
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/sv_sdk
      REDIS_URL: redis://redis:6379
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: http://localhost:5173
```

## Troubleshooting

### Configuration Not Loading

1. Check file location (must be in project root)
2. Verify JSON syntax (use a JSON validator)
3. Check file permissions
4. Enable debug logging: `LOG_LEVEL=debug`

### Environment Variables Not Applied

1. Restart the application after changes
2. Check variable names (case-sensitive)
3. Verify .env file is in correct location
4. Check for typos in variable names

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
echo $DATABASE_URL
```

### Redis Connection Issues

```bash
# Test connection
redis-cli -u $REDIS_URL ping

# Check Redis is running
redis-cli ping
```

## Next Steps

- [Authentication Guide →](/guides/authentication)
- [Deployment →](/guides/deployment)
- [Security Best Practices →](/packages/security)
