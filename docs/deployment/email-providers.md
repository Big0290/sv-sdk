# Email Provider Configuration

Complete guide for setting up email providers with SV-SDK.

---

## Supported Providers

- **Brevo** (formerly Sendinblue) - Recommended for most use cases
- **AWS SES** - For AWS-based infrastructure
- **Mock** - Development and testing only

---

## Brevo Setup

### 1. Create Account

1. Go to https://www.brevo.com/
2. Sign up for free account (300 emails/day)
3. Verify your email address

### 2. Get API Key

1. Navigate to **SMTP & API** → **API Keys**
2. Click **Generate a new API key**
3. Name it "SV-SDK Production"
4. Copy the key

### 3. Configure in .env

```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Verify Domain

1. Go to **Senders & IP** → **Domains**
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (can take up to 72 hours)

See [Email Authentication Guide](../../packages/email/docs/email-auth.md) for DNS setup.

### 5. Configure Webhook

1. Go to **Transactional** → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/email/webhook`
3. Select events: Delivered, Hard bounce, Soft bounce, Opened, Clicked, Spam, Unsubscribed
4. Copy the webhook secret

```bash
BREVO_WEBHOOK_SECRET=your-webhook-secret
```

### 6. Test Configuration

```bash
pnpm sdk email test --template notification --recipient test@example.com
```

---

## AWS SES Setup

### 1. Enable SES

1. Log into AWS Console
2. Navigate to Amazon SES
3. Select region (e.g., us-east-1)

### 2. Verify Domain

1. Go to **Verified identities**
2. Click **Create identity**
3. Select **Domain**
4. Enter your domain
5. Add the provided DNS records (DKIM CNAMEs)

### 3. Request Production Access

SES starts in sandbox mode (can only send to verified addresses).

1. Go to **Account dashboard**
2. Click **Request production access**
3. Fill out the form (use case, expected volume)
4. Wait for approval (24-48 hours)

### 4. Create IAM User

1. Go to IAM → Users → Create user
2. Name: `sv-sdk-ses`
3. Attach policy: `AmazonSESFullAccess` (or create custom policy)
4. Create access key
5. Copy Access Key ID and Secret Access Key

### 5. Configure in .env

```bash
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
EMAIL_FROM=noreply@yourdomain.com
```

### 6. Configure SNS for Webhooks

1. Create SNS topic for email events
2. Configure SES to publish events to SNS
3. Subscribe HTTPS endpoint to SNS topic
4. Confirm subscription

```bash
# Webhook endpoint
https://yourdomain.com/api/email/webhook/ses
```

### 7. Test Configuration

```bash
pnpm sdk email test --template notification --recipient test@example.com
```

---

## Mock Provider (Development)

For local development and testing:

```bash
EMAIL_PROVIDER=mock
EMAIL_FROM=dev@localhost
```

**Features**:
- Saves emails to filesystem (`/tmp/emails/`)
- No actual sending
- Instant delivery
- Perfect for CI/CD tests

---

## Provider Comparison

| Feature | Brevo | AWS SES | Mock |
|---------|-------|---------|------|
| Cost | Free tier (300/day) | $0.10 per 1000 | Free |
| Setup | Easy | Moderate | None |
| Deliverability | Excellent | Excellent | N/A |
| Webhooks | Built-in | Via SNS | N/A |
| Analytics | Dashboard | CloudWatch | N/A |
| Best For | Most use cases | AWS infrastructure | Development |

---

## Switching Providers

To switch providers, update `.env`:

```bash
# From Brevo to SES
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Restart application
pnpm dev
```

No code changes required - the SDK handles provider switching automatically.

---

## Testing Email Delivery

### 1. Send Test Email

```bash
pnpm sdk email test \
  --template verification_email \
  --recipient your-email@example.com
```

### 2. Check Email Headers

Open the received email and view headers. Look for:

```
Authentication-Results: spf=pass; dkim=pass; dmarc=pass
X-Provider: Brevo (or SES)
```

### 3. Use Mail Tester

1. Go to https://www.mail-tester.com/
2. Get the test email address
3. Send email to that address
4. Check your score (aim for 10/10)

---

## Troubleshooting

### Emails Not Sending

**Check**:
1. API key is correct
2. Provider is selected in .env
3. FROM address is verified
4. Application restarted after .env changes

```bash
# Test provider connection
pnpm sdk health
```

### Emails Going to Spam

**Solutions**:
1. Configure SPF, DKIM, DMARC (see email-auth.md)
2. Warm up domain (start with low volume)
3. Avoid spam trigger words
4. Include unsubscribe link
5. Use dedicated sending domain

### Webhook Not Receiving

**Check**:
1. Webhook URL is publicly accessible (use ngrok for local dev)
2. HTTPS is configured
3. Webhook secret matches
4. Correct events selected

**Test with ngrok** (development):
```bash
ngrok http 5173
# Use ngrok URL as webhook endpoint
```

---

## Best Practices

1. **Use Dedicated Domain** - e.g., `mail.yourdomain.com`
2. **Warm Up Gradually** - Start with 10 emails/day, double weekly
3. **Monitor Metrics** - Watch bounce rate, complaint rate
4. **Handle Bounces** - Remove bounced addresses from lists
5. **Test Before Production** - Always test with real email
6. **Keep Lists Clean** - Remove inactive users
7. **Follow CAN-SPAM** - Include unsubscribe, physical address

---

## Provider Pricing

### Brevo

- **Free**: 300 emails/day
- **Lite**: $25/month - 20,000 emails
- **Premium**: $59/month - 40,000 emails
- **Enterprise**: Custom pricing

### AWS SES

- **$0.10 per 1,000 emails**
- No monthly minimum
- Pay only for what you send
- Free tier: 62,000 emails/month (if sent from EC2)

---

## Support

- **Brevo**: https://help.brevo.com/
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **SV-SDK Issues**: https://github.com/your-org/sv-sdk/issues

