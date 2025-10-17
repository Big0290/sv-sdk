# Production Deployment Checklist

Complete checklist before deploying SV-SDK to production.

---

## Pre-Deployment

### Environment Configuration

- [ ] All environment variables configured (see `.env.example`)
- [ ] `BETTER_AUTH_SECRET` generated (min 32 chars random)
- [ ] `DATABASE_URL` points to production database
- [ ] `REDIS_URL` points to production Redis
- [ ] `EMAIL_PROVIDER` configured (brevo or ses)
- [ ] Email provider API keys set
- [ ] `NODE_ENV=production`
- [ ] CORS origins configured
- [ ] Secrets stored in secure vault (not in code)

### Database

- [ ] Production database provisioned
- [ ] Database backups configured (automated daily)
- [ ] Database connection SSL enabled
- [ ] Migrations tested in staging
- [ ] Seed data applied (roles, admin user, templates)
- [ ] Indexes created
- [ ] Connection pool sized appropriately (`DB_POOL_SIZE=20`)

### Redis

- [ ] Production Redis provisioned
- [ ] Redis password set (strong password)
- [ ] Persistence enabled (appendonly yes)
- [ ] Memory limit configured
- [ ] Eviction policy set (allkeys-lru)

### Application

- [ ] All packages built (`pnpm build`)
- [ ] Dependencies installed (production only)
- [ ] Health check endpoints working
- [ ] Logging configured (structured JSON)
- [ ] Error tracking configured (Sentry)

---

## Security

### Authentication & Authorization

- [ ] HTTPS enforced (no HTTP)
- [ ] HSTS header enabled
- [ ] Secure cookies enabled (`secure: true`)
- [ ] CSRF protection enabled
- [ ] Rate limiting enabled
- [ ] Session expiry configured
- [ ] Password policy enforced

### Headers

- [ ] Content-Security-Policy (CSP) configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy configured

### Secrets

- [ ] All secrets in environment variables
- [ ] Secrets never committed to git
- [ ] Production secrets different from development
- [ ] Secret rotation schedule defined

### Network

- [ ] Firewall configured (allow only necessary ports)
- [ ] Database not publicly accessible
- [ ] Redis not publicly accessible
- [ ] WAF configured (if using)
- [ ] DDoS protection enabled

---

## Email

### Domain Configuration

- [ ] Domain verified with email provider
- [ ] SPF record configured
- [ ] DKIM signing enabled
- [ ] DMARC policy configured
- [ ] Sending domain warmed up (gradual volume increase)

### Monitoring

- [ ] Bounce rate monitoring
- [ ] Complaint rate monitoring
- [ ] Delivery rate monitoring
- [ ] Webhook endpoint configured
- [ ] Unsubscribe links working

---

## Monitoring & Alerts

### Health Monitoring

- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Health check endpoints configured
- [ ] Alerts for downtime
- [ ] On-call rotation established

### Application Monitoring

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (APM)
- [ ] Log aggregation (ELK, Datadog)
- [ ] Metrics collection (Prometheus)
- [ ] Dashboards created (Grafana)

### Alerts Configured

- [ ] High error rate (> 1%)
- [ ] Slow response time (> 500ms)
- [ ] High memory usage (> 80%)
- [ ] High CPU usage (> 80%)
- [ ] Database connection issues
- [ ] Redis connection issues
- [ ] Queue backup (> 1000 jobs)
- [ ] High email bounce rate (> 5%)

---

## Performance

### Optimization

- [ ] Database queries optimized
- [ ] Indexes created
- [ ] Connection pooling configured
- [ ] Redis caching enabled
- [ ] Static assets on CDN
- [ ] Images optimized
- [ ] Gzip compression enabled

### Load Testing

- [ ] Load tests performed
- [ ] Bottlenecks identified and fixed
- [ ] Capacity planning done
- [ ] Auto-scaling configured (if applicable)

---

## Backup & Recovery

### Backups

- [ ] Database backups automated (daily)
- [ ] Backup retention policy (30 days minimum)
- [ ] Backups encrypted
- [ ] Backups stored off-site
- [ ] Backup restoration tested

### Disaster Recovery

- [ ] Recovery procedures documented
- [ ] RTO/RPO defined
- [ ] Failover tested
- [ ] Data restoration tested

---

## Compliance

### GDPR (if applicable)

- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data retention policies defined
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] PII masking in logs

### SOC2 (if applicable)

- [ ] Audit logging comprehensive
- [ ] Access controls implemented
- [ ] Encryption at rest and in transit
- [ ] Vendor management documented
- [ ] Incident response plan

---

## Testing

### Pre-Production Testing

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Security tests passing
- [ ] Performance tests passing

### Staging Environment

- [ ] Deploy to staging first
- [ ] Run full test suite in staging
- [ ] Perform manual testing
- [ ] Verify monitoring in staging
- [ ] Test backup and restore in staging

---

## Deployment

### Pre-Deployment

- [ ] Create deployment runbook
- [ ] Schedule deployment window
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Review changes one final time

### During Deployment

- [ ] Use blue-green or canary deployment
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify health checks
- [ ] Test critical user flows

### Post-Deployment

- [ ] Verify all services healthy
- [ ] Check error rates (should be normal)
- [ ] Monitor for 1 hour
- [ ] Update status page
- [ ] Document any issues

---

## Rollback Plan

### Automated Rollback Triggers

- Error rate > 5%
- Response time > 2x baseline
- Health checks failing

### Manual Rollback Steps

1. Stop new deployments
2. Route traffic to previous version
3. Verify rollback successful
4. Investigate issues
5. Document lessons learned

---

## Post-Launch

### Week 1

- [ ] Monitor error rates daily
- [ ] Review logs for issues
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Review security logs

### Month 1

- [ ] Performance review
- [ ] Security audit
- [ ] Cost optimization review
- [ ] User feedback collection
- [ ] Documentation updates

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | | | |
| DevOps | | | |
| Security | | | |
| Product Owner | | | |

---

**Deployment Status**: ⬜ Not Ready / ⬜ Ready / ⬜ Deployed

**Go-Live Date**: __________________

