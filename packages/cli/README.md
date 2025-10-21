# @big0290/cli

Command-line interface for managing the SV-SDK platform.

## Installation

### Global Installation

```bash
pnpm add -g @big0290/cli
```

### Workspace Installation

```bash
# In the monorepo
pnpm sdk <command>
```

## Usage

```bash
sdk [command] [options]
```

## Commands

### Auth Commands

**List users**:

```bash
sdk auth list
sdk auth list --role admin --limit 10
```

**Create user**:

```bash
sdk auth create --email user@example.com --name "John Doe" --role user
sdk auth create  # Interactive prompts
```

**Delete user**:

```bash
sdk auth delete --email user@example.com
sdk auth delete --email user@example.com --force
```

### Email Commands

**Send test email**:

```bash
sdk email test --template verification_email --recipient test@example.com
sdk email test  # Interactive prompts
```

**List templates**:

```bash
sdk email list-templates
```

**Validate MJML template**:

```bash
sdk email validate path/to/template.mjml
```

**Email statistics**:

```bash
sdk email stats
```

### Audit Commands

**Export logs**:

```bash
sdk audit export --from 2024-01-01 --to 2024-01-31 --format json
sdk audit export --format csv --output ./logs.csv
```

**Search logs**:

```bash
sdk audit search --event user.login --limit 50
sdk audit search --user user-123
```

**Apply retention**:

```bash
sdk audit retention --days 365
sdk audit retention --days 90 --no-archive
```

### Permission Commands

**List roles**:

```bash
sdk permissions list
```

**Assign role**:

```bash
sdk permissions assign --email user@example.com --role admin
```

**Check permission**:

```bash
sdk permissions check --email user@example.com --permission read:any:user
```

### Database Commands

**Run migrations**:

```bash
sdk db migrate
```

**Seed database**:

```bash
sdk db seed
```

**Database status**:

```bash
sdk db status
```

**Backup database**:

```bash
sdk db backup
sdk db backup --output /path/to/backups
```

### Health Check

**Check system health**:

```bash
sdk health
```

Shows status of:

- Database connection
- Redis connection
- Service health
- Latency metrics

## Configuration

The CLI uses environment variables from your `.env` file:

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BETTER_AUTH_SECRET=...
EMAIL_PROVIDER=...
```

## Interactive Mode

Most commands support interactive prompts if options are not provided:

```bash
$ sdk auth create
? Email address: user@example.com
? Full name: John Doe
✓ User created successfully!
```

## Output Formatting

The CLI uses colors and spinners for better UX:

- 🔵 Blue - Information
- ✅ Green - Success
- ⚠️ Yellow - Warnings
- ❌ Red - Errors

## Examples

### Create Admin User

```bash
sdk auth create \
  --email admin@example.com \
  --name "Admin User" \
  --role super_admin
```

### Export Last Month's Audit Logs

```bash
sdk audit export \
  --from $(date -d "1 month ago" +%Y-%m-%d) \
  --to $(date +%Y-%m-%d) \
  --format csv \
  --output audit-logs-$(date +%Y-%m).csv
```

### Check User Permissions

```bash
sdk permissions check \
  --email user@example.com \
  --permission update:any:user
```

### Send Test Notification

```bash
sdk email test \
  --template notification \
  --recipient admin@example.com
```

## Scripting

Exit codes for scripting:

- `0` - Success
- `1` - Error

```bash
#!/bin/bash

if sdk health; then
  echo "System is healthy"
else
  echo "System is down, alerting..."
  ./alert-ops-team.sh
fi
```

## Development

```bash
# Run CLI in development
cd packages/cli
pnpm dev

# Run command
tsx src/index.ts health
```

## Building

```bash
# Build CLI
pnpm build

# Make executable
chmod +x dist/index.js

# Link locally
npm link
```

## License

MIT
