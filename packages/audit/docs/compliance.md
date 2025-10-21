# Compliance Notes

Audit logging compliance considerations for GDPR, SOC2, and other regulations.

## GDPR Compliance

### Data Protection

**Right to Access (Art. 15)**:

- Users can request all audit logs related to their account
- Use `fetchAuditLogs({ userId: 'user-id' })` to retrieve user's audit trail

**Right to Erasure (Art. 17)**:

- Audit logs may need to be retained for legal/compliance reasons
- Consider "right to be forgotten" vs. legal retention requirements
- Implement pseudonymization instead of deletion where appropriate

**Data Minimization (Art. 5)**:

- Only log necessary information
- Mask PII by default
- Configure PII fields to match your requirements

**Purpose Limitation (Art. 5)**:

- Audit logs used only for security and compliance
- Document purpose in privacy policy
- Don't use audit data for marketing or analytics

### PII Handling

**Automatic PII Masking**:

```typescript
import { logAudit } from '@big0290/audit'

// PII is automatically masked
await logAudit('user.updated', {
  userId: 'user-123',
  email: 'user@example.com', // Masked as: us***@ex***om
  phone: '+1234567890', // Masked as: +1***890
  changes: { name: 'John Doe' }, // Name is masked
})
```

**Disable Masking** (when legally required to log PII):

```typescript
await logAudit(
  'gdpr.data.export',
  { userId: 'user-123', requestedBy: 'admin@example.com' },
  { maskPII: false } // Disable masking
)
```

### Retention Periods

**GDPR Recommendation**: Retain logs for legitimate business purposes only

```typescript
import { applyRetentionPolicy } from '@big0290/audit'

// Standard retention: 1 year
await applyRetentionPolicy({
  retentionDays: 365,
  archiveBeforeDelete: true,
})

// Extended retention for compliance: 7 years
await applyRetentionPolicy({
  retentionDays: 365 * 7,
  archiveBeforeDelete: true,
})
```

---

## SOC2 Compliance

### Audit Trail Requirements

**CC6.1 - Logical and Physical Access Controls**:

✅ All access attempts logged (login, logout, failed attempts)  
✅ User creation, modification, deletion logged  
✅ Session management logged  
✅ Permission checks logged

**CC7.2 - System Monitoring**:

✅ Security events logged and monitored  
✅ Failed authentication attempts tracked  
✅ Suspicious activity detected and logged  
✅ Rate limiting violations logged

**CC7.3 - Detection and Analysis**:

✅ Audit logs indexed for fast queries  
✅ Full-text search available  
✅ Export capability (CSV, JSON)  
✅ Real-time monitoring possible via event bus

### Data Integrity

**Tamper Detection**:

```typescript
import { verifyHashChain } from '@big0290/audit'

// Verify log integrity
const verification = await verifyHashChain(logs)

if (!verification.valid) {
  console.error('Tamper detected in logs:', verification.invalidLogs)
}
```

**Immutability**:

- Audit logs are append-only (no updates allowed)
- Database constraints prevent modification
- Hash chain provides cryptographic proof

### Retention and Archival

**SOC2 Requirement**: Maintain audit logs for sufficient period

```typescript
// Archive before deletion
const result = await applyRetentionPolicy({
  retentionDays: 365,
  archiveBeforeDelete: true,
  archiveDir: '/mnt/cold-storage/audit-logs',
  compressArchives: true,
})

console.log(`Archived ${result.deleted} logs to ${result.archivePath}`)
```

---

## HIPAA Compliance

### Audit Requirements

**§164.308(a)(1)(ii)(D) - Information System Activity Review**:

✅ Audit logs capture all access to protected health information (PHI)  
✅ Logs reviewed regularly for security incidents  
✅ Audit trail protects integrity of PHI

**§164.312(b) - Audit Controls**:

✅ Hardware, software, and procedural mechanisms record and examine access  
✅ Audit logs cannot be modified or deleted (append-only)

### PHI Logging

**NEVER log PHI in plain text**:

```typescript
// ❌ BAD - Logs PHI
await logAudit('patient.viewed', {
  diagnosis: 'Type 2 Diabetes',
  medications: ['Metformin', 'Insulin'],
})

// ✅ GOOD - Only log identifiers
await logAudit('patient.viewed', {
  patientId: 'patient-123',
  viewedBy: 'doctor-456',
  recordType: 'medical_history',
})
```

**Retention**: 6 years minimum (HIPAA requirement)

```typescript
await applyRetentionPolicy({
  retentionDays: 365 * 6, // 6 years
  archiveBeforeDelete: true,
})
```

---

## PCI DSS Compliance

### Requirement 10 - Track and Monitor Access

**10.2 - Automated Audit Trails**:

✅ User access to cardholder data logged  
✅ Actions by privileged users logged  
✅ Access to audit trails logged  
✅ Invalid logical access attempts logged  
✅ Changes to accounts logged

### Cardholder Data

**NEVER log cardholder data** (PAN, CVV, PIN):

```typescript
// ❌ BAD - Logs credit card
await logAudit('payment.processed', {
  cardNumber: '4111111111111111',
})

// ✅ GOOD - Log tokenized reference
await logAudit('payment.processed', {
  paymentTokenId: 'tok_abc123',
  last4: '1111',
  amount: 99.99,
})
```

**Retention**: At least 1 year (3 months online + 9 months archive)

```typescript
// Keep 1 year online
await applyRetentionPolicy({
  retentionDays: 365,
  archiveBeforeDelete: true,
})
```

---

## Best Practices

### 1. Log Relevant Events

**Do log**:

- Authentication events
- Authorization decisions
- Data access and modifications
- Security events
- System errors
- Administrative actions

**Don't log**:

- Passwords or credentials
- Credit card numbers
- Social security numbers
- Protected health information
- Personal financial information

### 2. Use Appropriate Retention

Consider:

- Legal requirements (GDPR, HIPAA, SOC2)
- Storage costs
- Compliance needs
- Business requirements

### 3. Regular Reviews

- Review audit logs regularly
- Set up alerts for suspicious activity
- Monitor for compliance violations
- Verify log integrity periodically

### 4. Secure Access

- Restrict access to audit logs
- Log access to audit logs (meta-logging)
- Encrypt archives
- Use read-only access where possible

---

## Compliance Checklist

- [ ] PII automatically masked in logs
- [ ] Retention policy configured
- [ ] Archive process automated
- [ ] Log integrity verified
- [ ] Access to logs restricted
- [ ] Logs backed up regularly
- [ ] Compliance requirements documented
- [ ] Regular audit log reviews scheduled
- [ ] Legal hold process defined
- [ ] Data deletion requests handled

---

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [SOC2 Framework](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)

---

**Disclaimer**: This is general guidance. Consult legal counsel for specific compliance requirements.
