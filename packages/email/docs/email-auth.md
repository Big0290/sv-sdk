# Email Authentication Setup

This guide explains how to configure SPF, DKIM, and DMARC for your email domain to improve deliverability.

## Why Email Authentication?

Email authentication proves that emails are legitimately sent from your domain and haven't been tampered with. This:

- ✅ Improves deliverability (less likely to be marked as spam)
- ✅ Prevents email spoofing
- ✅ Builds sender reputation
- ✅ Required by most email providers

---

## SPF (Sender Policy Framework)

SPF specifies which mail servers are authorized to send emails from your domain.

### For Brevo

Add this TXT record to your domain's DNS:

```
Type: TXT
Name: @ (or your subdomain)
Value: v=spf1 include:spf.brevo.com ~all
```

### For AWS SES

```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

### For Multiple Providers

```
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com include:amazonses.com ~all
```

### Verify SPF

```bash
# Check SPF record
dig TXT yourdomain.com

# Or use online tool
https://mxtoolbox.com/spf.aspx
```

---

## DKIM (DomainKeys Identified Mail)

DKIM adds a digital signature to your emails.

### For Brevo

1. Log in to Brevo dashboard
2. Go to **Senders & IP** → **Domains**
3. Add your domain
4. Brevo will provide DKIM records:

```
Type: TXT
Name: mail._domainkey.yourdomain.com
Value: [Brevo provides this - copy from dashboard]
```

5. Add the TXT records to your DNS
6. Verify in Brevo dashboard (click "Verify")

### For AWS SES

1. Verify domain in SES console
2. SES will provide 3 CNAME records
3. Add all 3 CNAME records to your DNS:

```
Type: CNAME
Name: [provided by SES]._domainkey.yourdomain.com
Value: [provided by SES].dkim.amazonses.com
```

4. Wait for verification (can take up to 72 hours)

### Verify DKIM

```bash
# Check DKIM record
dig TXT mail._domainkey.yourdomain.com

# Send test email and check headers
# Look for "DKIM-Signature:" header
```

---

## DMARC (Domain-based Message Authentication)

DMARC tells receiving servers what to do with emails that fail SPF/DKIM checks.

### Recommended DMARC Policy

Add this TXT record:

```
Type: TXT
Name: _dmarc.yourdomain.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100; adkim=s; aspf=s
```

**Explanation**:

- `v=DMARC1` - DMARC version
- `p=quarantine` - Quarantine emails that fail (safer than `reject`)
- `rua=mailto:dmarc@yourdomain.com` - Send aggregate reports here
- `pct=100` - Apply policy to 100% of emails
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment

### DMARC Policy Levels

Start with `none`, then move to stricter policies:

1. **Monitoring Mode** (`p=none`):

   ```
   v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

   - Collect reports without affecting delivery
   - Recommended for first 1-2 weeks

2. **Quarantine Mode** (`p=quarantine`):

   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=10
   ```

   - Start with 10% of emails
   - Gradually increase to 100%

3. **Reject Mode** (`p=reject`):
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com
   ```

   - Only after monitoring shows 100% compliance
   - Highest security level

### Verify DMARC

```bash
# Check DMARC record
dig TXT _dmarc.yourdomain.com
```

---

## Complete DNS Setup Example

For domain `yourdomain.com` using Brevo:

```
# SPF
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all

# DKIM (get from Brevo dashboard)
Type: TXT
Name: mail._domainkey
Value: k=rsa; p=MIGfMA0GCS...

# DMARC
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100
```

---

## Testing Email Deliverability

### 1. Send Test Email

```typescript
import { testTemplate } from '@big0290/email'

await testTemplate('notification', 'your-email@gmail.com', {
  subject: 'Test Email',
  title: 'Testing Email Setup',
  message: 'If you receive this, email is configured correctly!',
})
```

### 2. Check Email Headers

Open the email and view source/headers. Look for:

```
Authentication-Results: spf=pass; dkim=pass; dmarc=pass
DKIM-Signature: v=1; ...
```

### 3. Use Testing Tools

**Mail Tester**: https://www.mail-tester.com/

- Sends you a unique email address
- Forward your test email there
- Get a score out of 10

**MXToolbox**: https://mxtoolbox.com/

- Check SPF, DKIM, DMARC records
- Verify DNS propagation
- Test blacklist status

**Google Postmaster Tools**: https://postmaster.google.com/

- Monitor Gmail deliverability
- Track spam rate
- See domain reputation

---

## Common Issues

### Emails Going to Spam

**Solutions**:

- ✅ Configure SPF, DKIM, DMARC
- ✅ Warm up your domain (start with low volume)
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link
- ✅ Use proper from address (not noreply@gmail.com)
- ✅ Don't send to purchased lists

### SPF Record Not Found

**Check**:

- DNS propagation (can take 24-48 hours)
- Correct record name (@)
- No typos in value
- Only one SPF record per domain

### DKIM Not Verifying

**Check**:

- DNS records added correctly
- Wait for DNS propagation
- Verify in provider dashboard
- Check selector name matches

### DMARC Reports Not Received

**Check**:

- Email address in `rua` is valid
- DNS record correct
- Give it time (reports sent daily)

---

## Best Practices

1. **Start with Monitoring**: Use `p=none` for DMARC initially
2. **Monitor Reports**: Review DMARC reports regularly
3. **Gradual Rollout**: Increase DMARC `pct` gradually
4. **Keep Records Updated**: Update DNS when changing providers
5. **Test Regularly**: Send test emails after DNS changes
6. **Use Subdomains**: Consider using `mail.yourdomain.com` for transactional emails

---

## Subdomain Setup

For better organization, use subdomain for transactional emails:

**Subdomain**: `mail.yourdomain.com`

```
# SPF for subdomain
Type: TXT
Name: mail
Value: v=spf1 include:spf.brevo.com ~all

# DKIM for subdomain
Type: TXT
Name: mail._domainkey.mail
Value: [provided by Brevo]

# DMARC for subdomain
Type: TXT
Name: _dmarc.mail
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

Update `EMAIL_FROM`:

```bash
EMAIL_FROM=noreply@mail.yourdomain.com
```

---

## Monitoring Deliverability

### Check Sender Reputation

- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)
- [Sender Score](https://www.senderscore.org/)

### Monitor Bounce Rate

Keep bounce rate < 2%:

```typescript
const stats = await getEmailStats()
const bounceRate = (stats.bounced / stats.total) * 100

if (bounceRate > 2) {
  console.warn('High bounce rate:', bounceRate.toFixed(2) + '%')
}
```

---

## Resources

- [SPF Record Syntax](https://www.rfc-editor.org/rfc/rfc7208.html)
- [DKIM Specification](https://www.rfc-editor.org/rfc/rfc6376.html)
- [DMARC Overview](https://dmarc.org/overview/)
- [Google Email Sender Guidelines](https://support.google.com/mail/answer/81126)

---

## Quick Checklist

- [ ] SPF record added
- [ ] DKIM records added
- [ ] DMARC record added (start with p=none)
- [ ] Records verified in DNS
- [ ] Test email sent and received
- [ ] Headers checked (spf=pass, dkim=pass, dmarc=pass)
- [ ] Deliverability score tested (mail-tester.com)
- [ ] Monitoring set up for bounce rate
- [ ] Unsubscribe links included
- [ ] From address uses your domain
