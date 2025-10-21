# Production Migration Guide

Best practices for running database migrations in production.

---

## Migration Strategy

### Zero-Downtime Migrations

1. **Backward-Compatible Changes First**
   - Add new columns as nullable
   - Add new tables
   - Add new indexes

2. **Deploy Application**
   - Deploy new version that works with both old and new schema

3. **Apply Breaking Changes**
   - Make columns required
   - Remove old columns
   - Rename columns (via add + migrate + remove)

### Example: Adding Required Column

**Step 1: Add Nullable Column**

```sql
ALTER TABLE auth.users ADD COLUMN phone_number VARCHAR(20);
```

**Step 2: Deploy App (Handles NULL)**

```typescript
const user = await getUser(id)
// Handle phone_number being null
```

**Step 3: Backfill Data**

```sql
UPDATE auth.users SET phone_number = '' WHERE phone_number IS NULL;
```

**Step 4: Make Required**

```sql
ALTER TABLE auth.users ALTER COLUMN phone_number SET NOT NULL;
```

---

## Production Migration Checklist

### Pre-Migration

- [ ] Test migration in staging
- [ ] Create database backup
- [ ] Verify backup is restorable
- [ ] Review migration SQL
- [ ] Estimate migration duration
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders

### During Migration

- [ ] Put application in maintenance mode (if breaking changes)
- [ ] Create point-in-time snapshot
- [ ] Run migration
- [ ] Verify schema changes
- [ ] Run smoke tests
- [ ] Monitor application logs
- [ ] Check database performance

### Post-Migration

- [ ] Remove maintenance mode
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify functionality
- [ ] Keep backup for 7 days

---

## Running Migrations

### Development

```bash
# Generate migration
pnpm db:generate

# Review migration
cat packages/db-config/migrations/*_migration.sql

# Apply migration
pnpm db:migrate
```

### Staging

```bash
# Backup first
sdk db backup

# Run migration
DATABASE_URL=$STAGING_DATABASE_URL pnpm db:migrate

# Verify
sdk db status
```

### Production

```bash
# 1. Create backup
sdk db backup --output /backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql

# 2. Test in staging (again)
DATABASE_URL=$STAGING_DATABASE_URL pnpm db:migrate

# 3. Run in production
DATABASE_URL=$PRODUCTION_DATABASE_URL pnpm db:migrate

# 4. Verify
sdk db status

# 5. Monitor
tail -f /var/log/app.log
```

---

## Rollback Procedures

### Automatic Rollback

If migration fails, Drizzle automatically rolls back the transaction.

### Manual Rollback

```bash
# Restore from backup
sdk db restore /backups/pre-migration-20240117-140000.sql

# Or use database snapshot (AWS RDS)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier sv-sdk-prod \
  --target-db-instance-identifier sv-sdk-prod-rollback \
  --restore-time 2024-01-17T14:00:00Z
```

---

## Migration Patterns

### Adding Column

```typescript
// Safe (nullable first)
export const migration = pgTable('users', {
  newColumn: varchar('new_column', { length: 255 }), // nullable
})
```

### Removing Column

```typescript
// Step 1: Stop using column in app
// Step 2: Wait for deployment
// Step 3: Remove column in migration
```

### Renaming Column

```typescript
// Bad: ALTER TABLE users RENAME COLUMN old TO new (downtime!)

// Good:
// Step 1: Add new column, copy data
// Step 2: Deploy app using new column
// Step 3: Remove old column
```

### Data Migrations

```typescript
// Create separate data migration script
import { db, users } from '@big0290/db-config'

// Backfill data
await db.update(users).set({ status: 'active' }).where(isNull(users.status))
```

---

## Common Issues

### Migration Timeout

**Symptoms**: Migration hangs or times out

**Solutions**:

- Split large migrations into smaller chunks
- Add indexes in separate migration
- Use background jobs for data migrations
- Increase timeout in Drizzle config

### Lock Conflicts

**Symptoms**: Migration waiting for lock

**Solutions**:

- Run during low-traffic window
- Check for long-running queries
- Kill blocking queries (carefully!)
- Use `LOCK TIMEOUT` in SQL

### Failed Migration

**Symptoms**: Migration errors out

**Solutions**:

- Check error message
- Verify schema syntax
- Test in development first
- Rollback and retry

---

## Best Practices

1. **Always Backup** - Before any migration
2. **Test in Staging** - Catch issues before production
3. **Review SQL** - Manually review generated SQL
4. **Monitor Closely** - Watch logs during migration
5. **Keep Simple** - One logical change per migration
6. **Document Changes** - Add comments to migrations
7. **Schedule Wisely** - Low-traffic windows for breaking changes
8. **Have Rollback Plan** - Know how to revert

---

## Performance Considerations

### Adding Indexes

```sql
-- Create index concurrently (no locks)
CREATE INDEX CONCURRENTLY idx_users_email ON auth.users(email);
```

### Large Table Migrations

For tables > 1M rows:

- Create new table
- Copy data in batches
- Swap tables atomically
- Drop old table

### Minimize Downtime

- Use nullable columns initially
- Deploy backward-compatible code first
- Make breaking changes after deployment
- Use feature flags for gradual rollout

---

## Emergency Procedures

### Critical Production Issue

1. **Immediate**: Restore from backup
2. **Investigate**: Find root cause
3. **Fix**: Create hotfix migration
4. **Test**: Test hotfix in staging
5. **Deploy**: Apply hotfix to production
6. **Monitor**: Watch for issues
7. **Document**: Post-mortem

---

## Tools

- **Drizzle Studio**: Visual database browser
- **pg_dump/pg_restore**: Backup/restore
- **psql**: Direct SQL execution
- **Datadog/New Relic**: Migration monitoring

---

## Resources

- [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)
- [PostgreSQL DDL](https://www.postgresql.org/docs/current/ddl.html)
- [Zero-Downtime Deployments](https://www.braintreepayments.com/blog/safe-database-migration-pattern-without-downtime/)
