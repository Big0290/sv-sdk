# Security Checklist

Use this checklist to ensure all security measures are in place for production deployment.

## Authentication & Authorization

- [ ] All passwords hashed with Argon2 (handled by BetterAuth)
- [ ] Minimum password length: 12 characters
- [ ] Password complexity requirements enforced
- [ ] Password breach checking enabled (HaveIBeenPwned)
- [ ] Session tokens securely generated (cryptographically random)
- [ ] Session tokens stored securely (Redis with encryption)
- [ ] Sessions expire after inactivity
- [ ] Permission checks on all protected routes
- [ ] RBAC properly configured
- [ ] Admin routes restricted to admin roles only

## Rate Limiting

- [ ] Rate limiting enabled on login endpoint (5 attempts per 15 min)
- [ ] Rate limiting enabled on signup endpoint (3 attempts per hour)
- [ ] Rate limiting enabled on password reset (3 attempts per hour)
- [ ] Rate limiting enabled on API endpoints (100 per 15 min)
- [ ] Rate limiting enabled on email sending (10 per minute)
- [ ] Rate limit headers included in responses

## CSRF Protection

- [ ] CSRF tokens generated for all forms
- [ ] CSRF tokens validated on form submissions
- [ ] CSRF tokens expire after use (one-time use)
- [ ] SameSite cookie attribute set to 'strict' or 'lax'
- [ ] CSRF protection on all state-changing operations

## Input Validation & Sanitization

- [ ] All user input validated with Zod schemas
- [ ] HTML sanitized before display (XSS prevention)
- [ ] SQL queries use parameterized queries (Drizzle handles this)
- [ ] File uploads validated (type, size, content)
- [ ] Path inputs sanitized (prevent path traversal)
- [ ] URL inputs validated and sanitized
- [ ] Email addresses validated and normalized

## Security Headers

- [ ] Content-Security-Policy configured
- [ ] Strict-Transport-Security enabled (HSTS)
- [ ] X-Content-Type-Options set to 'nosniff'
- [ ] X-Frame-Options set to 'DENY' or 'SAMEORIGIN'
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

## CORS

- [ ] CORS origin whitelist configured
- [ ] Credentials properly handled
- [ ] Preflight requests handled correctly

## Secrets Management

- [ ] All secrets stored in environment variables
- [ ] Secrets never committed to git
- [ ] Production secrets rotated regularly
- [ ] Secrets redacted in logs
- [ ] Encryption keys generated securely
- [ ] Database credentials use strong passwords

## Data Protection

- [ ] Sensitive data encrypted at rest (if required)
- [ ] Sensitive data encrypted in transit (HTTPS)
- [ ] PII properly handled and masked in logs
- [ ] Audit logs don't contain sensitive data
- [ ] Database backups encrypted

## Session Security

- [ ] Session cookies marked as HttpOnly
- [ ] Session cookies marked as Secure (production)
- [ ] Session cookies use SameSite attribute
- [ ] Sessions invalidated on logout
- [ ] Sessions expire after reasonable time
- [ ] Concurrent session limits considered

## Email Security

- [ ] SPF record configured
- [ ] DKIM signing enabled
- [ ] DMARC policy configured
- [ ] Email headers sanitized
- [ ] Unsubscribe links included in marketing emails
- [ ] Email rate limiting in place

## Database Security

- [ ] Database credentials secured
- [ ] Database connections encrypted (SSL)
- [ ] Least privilege access for database user
- [ ] SQL injection prevention (ORM parameterized queries)
- [ ] Database backups encrypted
- [ ] Foreign key constraints enforced

## API Security

- [ ] API authentication required
- [ ] API rate limiting configured
- [ ] API versioning implemented
- [ ] Error messages don't leak sensitive information
- [ ] Request/Response logging sanitized

## Audit & Monitoring

- [ ] All authentication attempts logged
- [ ] All permission checks logged
- [ ] All security events logged
- [ ] Failed login attempts monitored
- [ ] Suspicious activity monitored
- [ ] Audit logs tamper-proof (hash chain)
- [ ] Audit logs retained per compliance requirements

## Deployment

- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Secrets management solution in place
- [ ] Network security groups configured
- [ ] Firewall rules configured
- [ ] WAF enabled (if applicable)

## Incident Response

- [ ] Security incident response plan documented
- [ ] Contact information for security team
- [ ] Breach notification procedures in place
- [ ] Security patch deployment process defined

## Compliance

- [ ] GDPR compliance reviewed (if applicable)
- [ ] SOC2 requirements reviewed (if applicable)
- [ ] Data retention policies configured
- [ ] User data deletion supported
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Testing

- [ ] Security tests written
- [ ] Penetration testing performed
- [ ] Dependency vulnerability scanning enabled
- [ ] Security headers tested
- [ ] CSRF protection tested
- [ ] Rate limiting tested

## Documentation

- [ ] Security features documented
- [ ] Vulnerability reporting process documented
- [ ] Security best practices documented
- [ ] Incident response procedures documented

---

## Critical Security TODOs

Items that MUST be addressed before production:

1. **Password Breach Checking**: Implement HaveIBeenPwned API integration
2. **Encryption Key Rotation**: Setup automated key rotation
3. **Security Monitoring**: Configure alerts for suspicious activity
4. **Penetration Testing**: Perform security audit
5. **Compliance Review**: Review GDPR/SOC2 requirements
6. **Incident Response Plan**: Create and test incident response procedures

---

## Security Contact

For security issues, contact: security@yourcompany.com

Never disclose security vulnerabilities publicly. Use responsible disclosure.
