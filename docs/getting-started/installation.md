# Installation

This guide will walk you through setting up SV-SDK in your development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Install Guide](https://pnpm.io/installation))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **Redis** >= 6 ([Download](https://redis.io/download))

### Optional

- **Docker** & **Docker Compose** ([Install Guide](https://docs.docker.com/get-docker/)) - For containerized development
- **Git** ([Download](https://git-scm.com/downloads)) - For version control

## Verify Prerequisites

Check your installations:

```bash
# Node.js version
node --version  # Should show v18.0.0 or higher

# pnpm version
pnpm --version  # Should show 8.0.0 or higher

# PostgreSQL
psql --version  # Should show 14.0 or higher

# Redis
redis-cli --version  # Should show 6.0 or higher
```

## Installation Methods

Choose the installation method that best fits your needs:

### Method 1: Clone the Repository

Clone the entire SV-SDK monorepo (recommended for exploring):

```bash
# Clone the repository
git clone https://github.com/your-org/sv-sdk.git
cd sv-sdk

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### Method 2: Add to Existing Project

Add SV-SDK packages to your existing SvelteKit project:

```bash
# Navigate to your project
cd your-sveltekit-project

# Install core packages
pnpm add @big0290/core @big0290/auth @big0290/permissions @big0290/ui

# Install additional packages as needed
pnpm add @big0290/email @big0290/audit @big0290/cache @big0290/security
```

### Method 3: Use Docker (Easiest)

Run the entire stack with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/sv-sdk.git
cd sv-sdk

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

This starts:

- PostgreSQL database
- Redis cache
- Admin application
- Demo application

## Database Setup

### Create PostgreSQL Database

#### Option 1: Local PostgreSQL

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE sv_sdk;
CREATE USER sv_sdk_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sv_sdk TO sv_sdk_user;

# Exit psql
\q
```

#### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name sv-sdk-postgres \
  -e POSTGRES_DB=sv_sdk \
  -e POSTGRES_USER=sv_sdk_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:16

# Verify it's running
docker ps | grep sv-sdk-postgres
```

### Run Migrations

```bash
# Generate migration files (if schema changed)
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed initial data (creates default roles, templates, etc.)
pnpm db:seed
```

The seed script creates:

- Default roles (super_admin, admin, manager, user)
- Email templates (verification, password reset, notification)
- Initial admin user (check console output for credentials)

## Redis Setup

### Option 1: Local Redis

```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping  # Should return: PONG
```

### Option 2: Docker Redis

```bash
# Run Redis in Docker
docker run --name sv-sdk-redis \
  -p 6379:6379 \
  -d redis:7

# Test connection
docker exec -it sv-sdk-redis redis-cli ping  # Should return: PONG
```

### Option 3: Redis Cloud

Use a managed Redis service:

- [Redis Cloud](https://redis.com/try-free/)
- [Upstash](https://upstash.com/)
- [AWS ElastiCache](https://aws.amazon.com/elasticache/)

## Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://sv_sdk_user:your_secure_password@localhost:5432/sv_sdk"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Authentication (BetterAuth)
BETTER_AUTH_SECRET="your_secret_key_at_least_32_characters_long_random_string"
BETTER_AUTH_URL="http://localhost:5173"
SESSION_MAX_AGE=604800  # 7 days in seconds

# Email Configuration
EMAIL_PROVIDER="brevo"  # Options: brevo, ses, mock
EMAIL_FROM="noreply@yourdomain.com"

# Brevo (if using Brevo)
BREVO_API_KEY="your_brevo_api_key"
BREVO_WEBHOOK_SECRET="your_webhook_secret"

# AWS SES (if using SES)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"

# Application
NODE_ENV="development"
PORT=5173

# Optional: Observability
SENTRY_DSN=""
LOG_LEVEL="debug"
```

### Generate Secure Secrets

```bash
# Generate BETTER_AUTH_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use openssl
openssl rand -base64 32
```

## Verify Installation

### Check Database Connection

```bash
# Using pnpm script
pnpm sdk health

# Or directly with psql
psql postgresql://sv_sdk_user:your_secure_password@localhost:5432/sv_sdk -c "SELECT version();"
```

### Check Redis Connection

```bash
# Test Redis
redis-cli -u redis://localhost:6379 ping
```

### Run Development Server

```bash
# Start all apps
pnpm dev

# Or start specific apps
pnpm --filter @big0290/admin dev
pnpm --filter demo-app dev
```

Visit:

- Admin app: http://localhost:5173
- Demo app: http://localhost:5174

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration

# Run with coverage
pnpm test:coverage
```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:

```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker"
  ]
}
```

### WebStorm

Enable Svelte support:

1. Go to Settings → Plugins
2. Install "Svelte" plugin
3. Restart IDE

## Common Installation Issues

### Issue: pnpm command not found

```bash
# Install pnpm globally
npm install -g pnpm

# Or use Corepack (Node 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Issue: PostgreSQL connection refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

### Issue: Redis connection refused

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server  # Foreground
redis-server --daemonize yes  # Background
```

### Issue: Port already in use

```bash
# Find process using port 5173
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3000 pnpm dev
```

### Issue: TypeScript errors after installation

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild packages
pnpm build
```

### Issue: Database migration failed

```bash
# Reset database (WARNING: deletes all data)
pnpm sdk db reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS sv_sdk;"
psql -U postgres -c "CREATE DATABASE sv_sdk;"
pnpm db:migrate
```

## Package-Specific Setup

Some packages require additional setup:

### Email Package

If using Brevo:

1. Sign up at [Brevo](https://www.brevo.com/)
2. Get API key from Settings → API Keys
3. Add to `.env`: `BREVO_API_KEY=your_key`

If using AWS SES:

1. Set up AWS account and verify email domains
2. Create IAM user with SES permissions
3. Add credentials to `.env`

### Observability Package

For Sentry integration:

1. Create project at [Sentry](https://sentry.io/)
2. Get DSN from project settings
3. Add to `.env`: `SENTRY_DSN=your_dsn`

## Next Steps

Now that you've installed SV-SDK:

1. [Quick Start Guide →](/getting-started/quick-start) - Build your first app
2. [Configuration →](/getting-started/configuration) - Customize the SDK
3. [Authentication Guide →](/guides/authentication) - Set up authentication

## Getting Help

If you run into issues:

- Check the [Troubleshooting Guide](/troubleshooting)
- Ask on [Discord](https://discord.gg/your-server)
- Open an [issue on GitHub](https://github.com/your-org/sv-sdk/issues)
