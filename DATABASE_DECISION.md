# Database Architecture Decision: Single DB with Multiple Schemas

## Executive Summary

**Decision**: Use a single PostgreSQL database (`sv_sdk`) with multiple PostgreSQL schemas (auth, email, audit, permissions) instead of separate databases.

**Rationale**: Atomic cross-schema transactions, simpler deployment, lower operational overhead, better performance.

---

## Comparison: Single DB with Schemas vs Multiple Databases

### Option 1: Single Database with Multiple Schemas (CHOSEN)

```
Database: sv_sdk
├── Schema: auth
│   ├── users
│   ├── sessions
│   ├── accounts
│   └── verifications
├── Schema: email
│   ├── email_templates
│   ├── email_sends
│   ├── email_webhooks
│   └── email_preferences
├── Schema: audit
│   └── audit_logs
└── Schema: permissions
    ├── roles
    ├── user_roles
    └── permission_cache
```

**Pros**:

- ✅ Atomic transactions across schemas (e.g., create user + assign role + log audit event)
- ✅ Single connection pool to manage
- ✅ Simpler deployment (one database to provision)
- ✅ Foreign key constraints work across schemas
- ✅ Easier local development setup
- ✅ Lower operational overhead (one backup, one monitoring setup)
- ✅ Better resource utilization
- ✅ Single migration orchestration
- ✅ Consistent query performance

**Cons**:

- ⚠️ Cannot scale individual schemas independently
- ⚠️ Schema separation is logical, not physical (but sufficient for most use cases)
- ⚠️ Requires proper permission management to prevent cross-schema access

**Connection**:

```typescript
// Single connection string
DATABASE_URL=postgresql://user:password@localhost:5432/sv_sdk

// Query with schema prefix
await db.select().from(auth.users)
await db.select().from(email.templates)
```

### Option 2: Multiple Separate Databases (REJECTED)

```
Database: sv_sdk_auth
├── users
├── sessions
├── accounts
└── verifications

Database: sv_sdk_email
├── email_templates
├── email_sends
└── email_webhooks

Database: sv_sdk_audit
└── audit_logs

Database: sv_sdk_permissions
├── roles
├── user_roles
└── permission_cache
```

**Pros**:

- ✅ Physical isolation between domains
- ✅ Can scale databases independently
- ✅ Different backup schedules per database

**Cons**:

- ❌ **No atomic transactions across databases**
- ❌ Multiple connection pools (4x resource usage)
- ❌ Complex deployment (4 databases to provision)
- ❌ Foreign key constraints don't work across databases
- ❌ Complicated local development (4 connection strings)
- ❌ 4x operational overhead (backups, monitoring, migrations)
- ❌ Coordination required for cross-database queries
- ❌ More expensive (4 database instances in production)

**Connection**:

```typescript
// Four separate connection strings
AUTH_DB_URL=postgresql://user:password@localhost:5432/sv_sdk_auth
EMAIL_DB_URL=postgresql://user:password@localhost:5433/sv_sdk_email
AUDIT_DB_URL=postgresql://user:password@localhost:5434/sv_sdk_audit
PERMISSIONS_DB_URL=postgresql://user:password@localhost:5435/sv_sdk_permissions

// Four separate clients to manage
const authDb = drizzle(postgres(process.env.AUTH_DB_URL))
const emailDb = drizzle(postgres(process.env.EMAIL_DB_URL))
const auditDb = drizzle(postgres(process.env.AUDIT_DB_URL))
const permissionsDb = drizzle(postgres(process.env.PERMISSIONS_DB_URL))
```

---

## Key Use Cases That Influenced the Decision

### 1. User Creation Flow

**With Single DB (CHOSEN)**:

```typescript
await db.transaction(async (tx) => {
  // Create user in auth schema
  const user = await tx.insert(auth.users).values(userData).returning()

  // Assign default role in permissions schema
  await tx.insert(permissions.user_roles).values({
    userId: user.id,
    roleId: defaultRoleId,
  })

  // Log creation in audit schema
  await tx.insert(audit.audit_logs).values({
    eventType: 'user.created',
    userId: user.id,
    metadata: { email: user.email },
  })
})
// ✅ All operations succeed or all fail (ACID)
```

**With Multiple DBs (REJECTED)**:

```typescript
// ❌ No atomic transaction across databases
// Must implement saga pattern or 2-phase commit

try {
  const user = await authDb.insert(users).values(userData).returning()

  try {
    await permissionsDb.insert(user_roles).values({ userId: user.id, roleId: defaultRoleId })
  } catch (error) {
    // ❌ User created but role assignment failed - INCONSISTENT STATE
    // Must manually rollback user creation
    await authDb.delete(users).where(eq(users.id, user.id))
  }

  try {
    await auditDb.insert(audit_logs).values({ eventType: 'user.created', userId: user.id })
  } catch (error) {
    // ❌ Audit log failed but user and role exist - DATA LOSS
  }
} catch (error) {
  // ❌ Complex error handling required
}
```

### 2. Query Performance

**With Single DB (CHOSEN)**:

```typescript
// Fast: Single database, efficient joins
const usersWithRoles = await db
  .select({
    user: auth.users,
    role: permissions.roles,
  })
  .from(auth.users)
  .leftJoin(permissions.user_roles, eq(auth.users.id, permissions.user_roles.userId))
  .leftJoin(permissions.roles, eq(permissions.user_roles.roleId, permissions.roles.id))
// ✅ Single query, optimized by PostgreSQL
```

**With Multiple DBs (REJECTED)**:

```typescript
// Slow: Must fetch from two databases and join in application
const users = await authDb.select().from(users)
const userRoles = await permissionsDb.select().from(user_roles)
const roles = await permissionsDb.select().from(roles)

// ❌ Application-level join (slow, memory-intensive)
const usersWithRoles = users.map((user) => ({
  ...user,
  role: roles.find((r) => r.id === userRoles.find((ur) => ur.userId === user.id)?.roleId),
}))
```

---

## Migration Implications

### Single DB with Schemas (CHOSEN)

```typescript
// One migration runner, schema-aware
await migrate(db, {
  migrationsFolder: './migrations',
  schemas: ['auth', 'email', 'audit', 'permissions'],
})
// ✅ Drizzle handles schema prefixes automatically
```

**Migration file example**:

```sql
-- migrations/0001_create_users.sql
CREATE TABLE auth.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  ...
);

CREATE TABLE permissions.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ...
);

-- ✅ Can create foreign keys across schemas
ALTER TABLE permissions.user_roles
  ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id);
```

### Multiple DBs (REJECTED)

```typescript
// ❌ Four separate migration runners
await migrate(authDb, { migrationsFolder: './migrations/auth' })
await migrate(emailDb, { migrationsFolder: './migrations/email' })
await migrate(auditDb, { migrationsFolder: './migrations/audit' })
await migrate(permissionsDb, { migrationsFolder: './migrations/permissions' })

// ❌ Manual coordination required if migrations have dependencies
```

---

## Performance Considerations

### Connection Pooling

**Single DB (CHOSEN)**:

- One pool of 20 connections
- Efficient resource utilization
- Lower memory footprint
- Easier to tune

**Multiple DBs (REJECTED)**:

- Four pools of 5 connections each (same total)
- Inefficient: auth pool might be idle while email pool is maxed out
- Higher memory footprint
- Complex tuning required

### Query Performance

| Operation            | Single DB            | Multiple DBs                 |
| -------------------- | -------------------- | ---------------------------- |
| User CRUD            | ~10ms                | ~10ms                        |
| User with roles      | ~15ms (single query) | ~40ms (2 queries + app join) |
| User creation + role | ~20ms (transaction)  | ~60ms (3 separate ops)       |
| Audit logging        | ~5ms (async)         | ~5ms (async)                 |
| Cross-domain reports | Fast (SQL joins)     | Slow (app joins)             |

### Backup & Restore

**Single DB (CHOSEN)**:

```bash
# One backup command
pg_dump sv_sdk > backup.sql

# One restore command
psql sv_sdk < backup.sql
```

**Multiple DBs (REJECTED)**:

```bash
# Four backup commands
pg_dump sv_sdk_auth > backup_auth.sql
pg_dump sv_sdk_email > backup_email.sql
pg_dump sv_sdk_audit > backup_audit.sql
pg_dump sv_sdk_permissions > backup_permissions.sql

# Four restore commands (must coordinate timing)
psql sv_sdk_auth < backup_auth.sql
psql sv_sdk_email < backup_email.sql
psql sv_sdk_audit < backup_audit.sql
psql sv_sdk_permissions < backup_permissions.sql
```

---

## Production Deployment

### Single DB (CHOSEN)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk
      POSTGRES_USER: sv_sdk_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
```

```sql
-- scripts/init-db.sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS email;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS permissions;

GRANT ALL ON SCHEMA auth TO sv_sdk_user;
GRANT ALL ON SCHEMA email TO sv_sdk_user;
GRANT ALL ON SCHEMA audit TO sv_sdk_user;
GRANT ALL ON SCHEMA permissions TO sv_sdk_user;
```

**Cost** (AWS RDS example):

- Single `db.t3.medium` instance: **$62/month**
- Total: **$62/month**

### Multiple DBs (REJECTED)

```yaml
# docker-compose.yml
services:
  postgres-auth:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk_auth
      # ...

  postgres-email:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk_email
      # ...

  postgres-audit:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk_audit
      # ...

  postgres-permissions:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sv_sdk_permissions
      # ...
```

**Cost** (AWS RDS example):

- Four `db.t3.small` instances: **$30/month × 4 = $120/month**
- Or one `db.t3.medium` with 4 databases: **$62/month** (same as single DB, so why split?)

---

## Security & Permissions

### Schema-Level Permissions

```sql
-- Application user: read/write access to all schemas
GRANT ALL ON SCHEMA auth TO sv_sdk_user;
GRANT ALL ON SCHEMA email TO sv_sdk_user;
GRANT ALL ON SCHEMA audit TO sv_sdk_user;
GRANT ALL ON SCHEMA permissions TO sv_sdk_user;

-- Read-only user (for analytics/reporting)
GRANT USAGE ON SCHEMA auth, email, audit, permissions TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA email TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA permissions TO readonly_user;

-- Audit-only user (for compliance/external auditing)
GRANT USAGE ON SCHEMA audit TO auditor_user;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO auditor_user;
```

**Benefit**: Fine-grained access control without separate databases.

---

## When to Reconsider

### Scenarios Where Multiple DBs Might Be Necessary

1. **Massive scale**: > 10,000 queries/second requiring horizontal sharding
2. **Regulatory requirements**: Legal mandate for physical database separation
3. **Different backup schedules**: E.g., audit logs backed up every hour, user data once per day
4. **Different geographic regions**: User data in US, email logs in EU (GDPR)
5. **Different database engines**: E.g., PostgreSQL for relational data, MongoDB for logs

**Current Assessment**: None of these apply to this project. Start with single DB and migrate later if needed.

---

## Conclusion

**Decision**: Single PostgreSQL database with multiple schemas.

**Primary Reasons**:

1. Atomic transactions across domains (critical for data integrity)
2. Simpler development and deployment
3. Better performance for cross-domain queries
4. Lower operational overhead
5. Easier to manage in production

**Migration Path**: If scale requires it, can later split to multiple databases with minimal code changes (Drizzle abstracts connection management).

---

## References

- [PostgreSQL Schemas Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Drizzle ORM Multi-Schema Support](https://orm.drizzle.team/docs/schemas)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-partitioning.html)
