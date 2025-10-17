# Troubleshooting Guide

Common issues and solutions for SV-SDK.

---

## Installation Issues

### pnpm install fails

**Error**: `ERR_PNPM_UNSUPPORTED_ENGINE`

**Solution**:
```bash
# Update Node.js to version 18+
nvm install 18
nvm use 18

# Update pnpm
npm install -g pnpm@latest
```

### Turbo not found

**Solution**:
```bash
pnpm install turbo -D
```

---

## Database Issues

### Cannot connect to database

**Symptoms**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:
1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Start PostgreSQL:
   ```bash
   docker-compose up -d postgres
   ```

3. Check DATABASE_URL in `.env`:
   ```bash
   DATABASE_URL=postgresql://sv_sdk_user:password@localhost:5432/sv_sdk
   ```

### Migration failed

**Solution**:
```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM drizzle_migrations;"

# Reset and rerun
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

### Schemas not found

**Solution**:
```bash
# Recreate database with schemas
docker-compose down -v
docker-compose up -d

# Wait for init script to run
sleep 5

# Verify schemas
psql $DATABASE_URL -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('auth', 'email', 'audit', 'permissions');"
```

---

## Redis Issues

### Cannot connect to Redis

**Symptoms**: `connect ECONNREFUSED 127.0.0.1:6379`

**Solutions**:
1. Check if Redis is running:
   ```bash
   docker-compose ps redis
   ```

2. Test connection:
   ```bash
   docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} ping
   # Should return: PONG
   ```

3. Check REDIS_URL in `.env`

### Queue not processing

**Solutions**:
1. Check if worker is running
2. Check Redis connection
3. View queue metrics:
   ```bash
   sdk email stats
   ```

---

## Build Issues

### Build fails with type errors

**Solutions**:
1. Regenerate database types:
   ```bash
   pnpm db:generate
   ```

2. Clear TypeScript cache:
   ```bash
   rm -rf packages/*/tsconfig.tsbuildinfo
   pnpm type-check
   ```

3. Reinstall dependencies:
   ```bash
   pnpm clean
   pnpm install --force
   pnpm build
   ```

### Circular dependency error

**Solution**:
```bash
# Check for circular dependencies
pnpm --filter @sv-sdk/my-package exec madge --circular src/index.ts

# Fix by restructuring imports
```

---

## Runtime Issues

### BetterAuth not working

**Common causes**:
1. `BETTER_AUTH_SECRET` not set or too short (min 32 chars)
2. `BETTER_AUTH_URL` doesn't match application URL
3. Database migrations not run

**Solution**:
```bash
# Generate strong secret
openssl rand -base64 32

# Add to .env
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:5173

# Run migrations
pnpm db:migrate
```

### Sessions not persisting

**Solutions**:
1. Check cookie settings (secure, sameSite)
2. Verify Redis is accessible
3. Check session expiry settings
4. Use HTTPS in production

### Rate limiting too aggressive

**Solution**:
```bash
# Adjust in .env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW=900000

# Or disable temporarily
RATE_LIMIT_ENABLED=false
```

---

## Email Issues

### Emails not sending

**Solutions**:
1. Check EMAIL_PROVIDER in `.env`
2. For Brevo: Verify API key
3. Check queue worker is running
4. Review email queue:
   ```bash
   sdk email stats
   ```

### MJML compilation errors

**Solution**:
```bash
# Validate template
sdk email validate path/to/template.mjml

# Check for syntax errors in MJML
```

### Emails going to spam

**Solutions**:
1. Configure SPF, DKIM, DMARC (see docs/email-auth.md)
2. Warm up domain (start with low volume)
3. Avoid spam trigger words
4. Include unsubscribe link

---

## Permission Issues

### Permission denied errors

**Solutions**:
1. Check user roles:
   ```bash
   sdk permissions check --email user@example.com --permission read:any:user
   ```

2. Assign correct role:
   ```bash
   sdk permissions assign --email user@example.com --role admin
   ```

3. Clear permission cache:
   ```typescript
   await refreshPermissionCache(userId)
   ```

---

## Performance Issues

### Slow database queries

**Solutions**:
1. Check indexes are created
2. Use EXPLAIN ANALYZE:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

3. Increase connection pool:
   ```bash
   DB_POOL_SIZE=50
   ```

### High memory usage

**Solutions**:
1. Check for memory leaks
2. Reduce cache TTL
3. Clear Redis cache:
   ```bash
   docker-compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHDB
   ```

### Cache not working

**Solutions**:
1. Verify Redis connection
2. Check cache TTL settings
3. Monitor cache hit rate

---

## Development Issues

### Hot reload not working

**Solutions**:
1. Restart dev server:
   ```bash
   pkill -f "vite"
   pnpm dev
   ```

2. Clear build cache:
   ```bash
   rm -rf .svelte-kit .turbo
   pnpm dev
   ```

### Port already in use

**Solution**:
```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>
```

---

## Getting More Help

1. **Check logs**: Most issues show up in logs
2. **Search issues**: GitHub issues for similar problems
3. **Ask for help**: GitHub Discussions
4. **Documentation**: Read package READMEs

---

## Debug Mode

Enable debug mode for verbose logging:

```bash
# In .env
DEBUG=true
LOG_LEVEL=debug

# Or for specific run
DEBUG=true pnpm dev
```

---

## Common Error Messages

### "BETTER_AUTH_SECRET is not set"

Set in `.env`:
```bash
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

### "DATABASE_URL environment variable is not set"

Set in `.env`:
```bash
DATABASE_URL=postgresql://sv_sdk_user:password@localhost:5432/sv_sdk
```

### "Redis connection error"

Start Redis:
```bash
docker-compose up -d redis
```

### "Module not found: @sv-sdk/..."

Rebuild packages:
```bash
pnpm build
```

---

For more help, see [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md)

