# Backup & Disaster Recovery

Comprehensive backup and recovery procedures for SV-SDK.

---

## Backup Strategy

### What to Backup

1. **Critical Data** (Must restore):
   - Database (all schemas)
   - Redis snapshots
   - Environment configuration
   - Secrets/certificates

2. **Important Data** (Should restore):
   - Application logs
   - Email templates (also in git)
   - Uploaded files (if any)

3. **Reproducible** (Can recreate):
   - Application code (in git)
   - Docker images (in registry)
   - Node modules (reinstallable)

---

## Database Backups

### Automated Daily Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/postgres"
FILENAME="sv_sdk-${DATE}.sql.gz"

# Create backup
docker exec sv-sdk-postgres pg_dump -U sv_sdk_user sv_sdk | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verify backup
if [ -f "${BACKUP_DIR}/${FILENAME}" ]; then
  echo "Backup created: ${FILENAME}"

  # Upload to S3
  aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://my-backups/postgres/"

  # Clean up old backups (keep last 30 days)
  find "${BACKUP_DIR}" -name "sv_sdk-*.sql.gz" -mtime +30 -delete
else
  echo "Backup failed!"
  exit 1
fi
```

**Cron job**:

```cron
# Run daily at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh
```

### Manual Backup

```bash
# Using CLI
pnpm sdk db backup --output /backups/manual-$(date +%Y%m%d).sql

# Or direct pg_dump
docker exec sv-sdk-postgres pg_dump \
  -U sv_sdk_user \
  -Fc \
  sv_sdk > backup.dump
```

### Point-in-Time Recovery (Cloud)

**AWS RDS**:

```bash
# Restore to specific time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier sv-sdk-prod \
  --target-db-instance-identifier sv-sdk-restored \
  --restore-time 2024-01-17T14:30:00Z
```

---

## Redis Backups

### Enable Persistence

```bash
# In redis.conf or docker-compose
appendonly yes
appendfsync everysec
```

### Manual Snapshot

```bash
# Trigger snapshot
docker exec sv-sdk-redis redis-cli BGSAVE

# Copy snapshot
docker cp sv-sdk-redis:/data/dump.rdb ./redis-backup.rdb
```

---

## Backup Verification

### Test Restoration

**Weekly restoration test**:

```bash
#!/bin/bash
# Test latest backup

# 1. Get latest backup
LATEST=$(ls -t /backups/postgres/*.sql.gz | head -1)

# 2. Create test database
createdb sv_sdk_restore_test

# 3. Restore
gunzip -c "${LATEST}" | psql sv_sdk_restore_test

# 4. Verify data
psql sv_sdk_restore_test -c "SELECT COUNT(*) FROM auth.users;"

# 5. Clean up
dropdb sv_sdk_restore_test

echo "Backup verification successful"
```

---

## Disaster Recovery

### Recovery Time Objective (RTO)

**Target**: 1 hour from disaster to service restored

### Recovery Point Objective (RPO)

**Target**: 5 minutes of data loss maximum

### DR Procedure

**1. Assess Damage**:

- Identify what's affected
- Determine if backup needed

**2. Notify Stakeholders**:

- Update status page
- Notify team
- Start incident log

**3. Restore from Backup**:

**Database**:

```bash
# Stop application
docker-compose down app

# Restore database
gunzip -c /backups/latest.sql.gz | psql $DATABASE_URL

# Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM auth.users;"

# Restart application
docker-compose up -d
```

**Redis**:

```bash
# Stop Redis
docker-compose stop redis

# Replace dump.rdb
docker cp redis-backup.rdb sv-sdk-redis:/data/dump.rdb

# Restart Redis
docker-compose start redis
```

**4. Verify Service**:

```bash
# Check health
pnpm sdk health

# Test critical flows
curl http://localhost:3000/api/v1/users
```

**5. Monitor**:

- Watch error rates
- Check logs
- Monitor performance
- Verify data integrity

**6. Post-Mortem**:

- Document what happened
- Identify root cause
- Create prevention tasks

---

## Backup Retention Policy

### Production

| Backup Type     | Frequency     | Retention |
| --------------- | ------------- | --------- |
| Full            | Daily         | 30 days   |
| Incremental     | Every 6 hours | 7 days    |
| Weekly Archive  | Weekly        | 1 year    |
| Monthly Archive | Monthly       | 7 years   |

### Development/Staging

| Backup Type | Frequency | Retention |
| ----------- | --------- | --------- |
| Full        | Daily     | 7 days    |

---

## Backup Security

### Encryption

**Encrypt backups**:

```bash
# Encrypt with GPG
pg_dump sv_sdk | gzip | gpg --encrypt --recipient backup@example.com > backup.sql.gz.gpg

# Decrypt
gpg --decrypt backup.sql.gz.gpg | gunzip | psql sv_sdk
```

### Access Control

- Store backups in private S3 bucket
- Use IAM roles for access
- Enable versioning
- Enable MFA delete

### Off-Site Storage

**Copy to multiple locations**:

```bash
# Primary: S3 in us-east-1
aws s3 cp backup.sql.gz s3://backups-us-east-1/

# Secondary: S3 in eu-west-1
aws s3 cp backup.sql.gz s3://backups-eu-west-1/

# Tertiary: Local NAS
cp backup.sql.gz /mnt/nas/backups/
```

---

## Monitoring Backups

### Backup Alerts

**Alert if**:

- Backup fails
- Backup size anomalous (> 2x normal)
- Backup not created in 25 hours
- Restore test fails

**Monitoring script**:

```bash
#!/bin/bash
# Check if backup exists from today

TODAY=$(date +%Y%m%d)
BACKUP=$(ls /backups/postgres/sv_sdk-${TODAY}*.sql.gz 2>/dev/null)

if [ -z "$BACKUP" ]; then
  echo "ERROR: No backup found for today!"
  # Send alert
  exit 1
else
  echo "Backup found: $BACKUP"

  # Check size
  SIZE=$(stat -f%z "$BACKUP")
  if [ $SIZE -lt 1000000 ]; then
    echo "WARNING: Backup seems too small ($SIZE bytes)"
  fi
fi
```

---

## Recovery Scenarios

### Scenario 1: Corrupted Database

**Steps**:

1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application
5. Monitor for issues

**Commands**:

```bash
docker-compose down app
gunzip -c /backups/latest.sql.gz | psql $DATABASE_URL
docker-compose up -d app
pnpm sdk health
```

### Scenario 2: Deleted Data

**Steps**:

1. Create temporary database
2. Restore backup to temp DB
3. Extract deleted data
4. Insert into production
5. Verify

**Commands**:

```bash
createdb sv_sdk_temp
gunzip -c /backups/latest.sql.gz | psql sv_sdk_temp
pg_dump sv_sdk_temp -t auth.users -a | psql sv_sdk
dropdb sv_sdk_temp
```

### Scenario 3: Complete Infrastructure Loss

**Steps**:

1. Provision new infrastructure
2. Restore database from off-site backup
3. Restore Redis from snapshot
4. Restore environment variables from secure storage
5. Deploy application
6. Verify all systems

**Time estimate**: 2-4 hours

---

## Testing Recovery

### Monthly DR Drill

1. **Schedule**: Last Sunday of month
2. **Scenario**: Complete infrastructure loss
3. **Team**: Full on-call rotation
4. **Goal**: Restore service in < 2 hours
5. **Document**: Time taken, issues encountered, improvements

**Drill checklist**:

- [ ] Provision new environment
- [ ] Restore database
- [ ] Restore Redis
- [ ] Configure environment
- [ ] Deploy application
- [ ] Run smoke tests
- [ ] Measure time taken
- [ ] Document lessons learned

---

## Compliance

### GDPR Requirements

- Encrypt backups containing PII
- Secure access to backups
- Implement data retention
- Support data deletion requests

### SOC 2 Requirements

- Automated backup schedule
- Backup verification
- Secure backup storage
- Documented recovery procedures
- Regular DR testing

---

## Backup Checklist

### Daily

- [ ] Automated backup runs
- [ ] Backup uploaded to S3
- [ ] Backup size verified
- [ ] No errors in logs

### Weekly

- [ ] Restore test completed
- [ ] Off-site copy verified
- [ ] Old backups cleaned up

### Monthly

- [ ] DR drill completed
- [ ] Backup strategy reviewed
- [ ] Storage costs reviewed
- [ ] Access logs reviewed

---

## Tools

- **pg_dump / pg_restore** - PostgreSQL backup/restore
- **AWS Backup** - Managed backup service
- **Velero** - Kubernetes backup
- **Restic** - Encrypted backups

---

## Resources

- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
- [AWS RDS Backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)
- [Disaster Recovery Best Practices](https://aws.amazon.com/disaster-recovery/)
