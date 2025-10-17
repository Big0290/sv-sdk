# Incident Response Guide

Procedures for responding to production incidents.

---

## Incident Severity Levels

### SEV-1: Critical

**Impact**: Complete service outage or data loss

**Examples**:
- Application completely down
- Database corruption
- Security breach
- Data loss

**Response Time**: Immediate  
**Resolution Time**: < 1 hour

### SEV-2: High

**Impact**: Major feature broken or significant performance degradation

**Examples**:
- Login not working
- Email sending failed
- Slow response times (> 5 seconds)

**Response Time**: < 15 minutes  
**Resolution Time**: < 4 hours

### SEV-3: Medium

**Impact**: Minor feature broken, workaround available

**Examples**:
- Non-critical feature broken
- UI issues
- Minor performance issues

**Response Time**: < 1 hour  
**Resolution Time**: < 24 hours

### SEV-4: Low

**Impact**: Cosmetic issues, no functional impact

**Examples**:
- Typos in UI
- Minor style issues

**Response Time**: Best effort  
**Resolution Time**: Next release

---

## Incident Response Process

### 1. Detection

**Alerts**:
- Monitoring alerts (Sentry, Prometheus)
- User reports
- Support tickets
- Social media mentions

**Initial Assessment** (< 5 minutes):
- Severity level
- Impact scope
- Number of users affected
- Business impact

### 2. Response

**Immediate Actions**:
1. Acknowledge incident
2. Assign incident commander
3. Create incident channel (Slack, Discord)
4. Start incident timeline document

**Communication**:
- Update status page
- Notify stakeholders
- Internal team communication

### 3. Investigation

**Gather Information**:
```bash
# Check service health
sdk health

# View recent logs
docker-compose logs --tail=100 app

# Check error rates
# Review Sentry errors

# Database status
sdk db status

# Queue status
sdk email stats
```

**Common Checks**:
- Service health checks
- Error logs
- Database connectivity
- Redis connectivity
- Queue depth
- Disk space
- Memory usage
- CPU usage

### 4. Resolution

**Fix and Deploy**:
1. Identify root cause
2. Develop fix (or rollback)
3. Test fix in staging
4. Deploy to production
5. Verify fix

**Rollback if Needed**:
```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml up -d app:previous

# Or restore database
pnpm db:restore /path/to/backup.sql
```

### 5. Post-Incident

**Within 24 hours**:
- Update status page (resolved)
- Internal post-mortem meeting
- Document timeline

**Within 1 week**:
- Write post-mortem document
- Identify action items
- Update runbooks

---

## Common Incidents

### Application Down

**Symptoms**:
- Health checks failing
- 502/503 errors
- Timeout errors

**Investigation**:
```bash
# Check if container running
docker ps | grep sv-sdk

# Check container logs
docker logs sv-sdk-app

# Check resource usage
docker stats sv-sdk-app
```

**Solutions**:
- Restart container
- Check resource limits
- Review recent deployments
- Check dependencies (DB, Redis)

### Database Connection Failed

**Symptoms**:
- "Database connection error" in logs
- 500 errors on all requests

**Investigation**:
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
sdk db status
```

**Solutions**:
- Restart application (refresh connections)
- Check database server status
- Verify credentials
- Check network connectivity
- Increase connection pool if needed

### High Error Rate

**Symptoms**:
- Error rate > 5%
- Many 500 errors

**Investigation**:
- Review error logs (Sentry)
- Check recent deployments
- Check database queries
- Review error patterns

**Solutions**:
- Rollback recent deployment
- Fix code bugs
- Optimize slow queries
- Scale resources

### Email Queue Backed Up

**Symptoms**:
- Queue depth > 10,000
- Emails delayed

**Investigation**:
```bash
sdk email stats
```

**Solutions**:
- Scale workers:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d --scale worker=10
  ```
- Check email provider status
- Review failed jobs
- Pause queue if provider is down

---

## Escalation Path

1. **On-Call Engineer** - First responder
2. **Senior Engineer** - If not resolved in 30 minutes
3. **Engineering Manager** - SEV-1 incidents
4. **CTO/VP Engineering** - Major outages

---

## Communication Templates

### Status Page Update

```
🔴 Investigating: We are currently investigating issues with [service].
Users may experience [impact]. We will provide updates as soon as possible.

🟡 Identified: We have identified the issue with [service] and are working on a fix.

🟢 Resolved: The issue with [service] has been resolved. All systems are operational.
```

### Internal Update

```
[SEV-1] Incident: [Brief description]

Status: Investigating / In Progress / Resolved
Impact: [Description of user impact]
Start Time: [Time]
Assigned To: [Name]
Actions Taken:
- [Action 1]
- [Action 2]
Next Steps:
- [Step 1]
- [Step 2]
```

---

## Post-Mortem Template

```markdown
# Incident Post-Mortem

## Summary
[Brief description of incident]

## Timeline
- HH:MM - Issue detected
- HH:MM - Incident declared (SEV-X)
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Impact
- Duration: X hours Y minutes
- Users affected: Approximately X users
- Requests failed: X%

## Root Cause
[Detailed explanation of what caused the incident]

## Resolution
[How the incident was resolved]

## Action Items
1. [ ] [Preventive action 1] - Assigned to: [Name] - Due: [Date]
2. [ ] [Preventive action 2] - Assigned to: [Name] - Due: [Date]

## Lessons Learned
### What Went Well
- [Item 1]
- [Item 2]

### What Could Be Improved
- [Item 1]
- [Item 2]
```

---

## Prevention

### Monitoring

- Set up comprehensive alerts
- Monitor key metrics
- Review logs regularly
- Perform load testing

### Testing

- Comprehensive test coverage
- Integration tests
- E2E tests
- Chaos engineering (advanced)

### Documentation

- Keep runbooks updated
- Document common issues
- Share knowledge in team

---

## Tools

- **Monitoring**: Sentry, Prometheus, Grafana
- **Logs**: ELK Stack, Datadog
- **Communication**: Slack, PagerDuty
- **Status Page**: Statuspage.io

---

## Contacts

- On-Call Engineer: [Contact]
- Engineering Manager: [Contact]
- DevOps Lead: [Contact]
- Security Team: [Contact]

