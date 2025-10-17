# @sv-sdk/email

Comprehensive email system with MJML templates, multiple providers, queue processing, and webhook handling.

## Features

- **MJML Templates** - Responsive email templates
- **Multi-Provider** - Brevo, AWS SES, Mock
- **Queue Processing** - BullMQ for reliable delivery
- **Webhook Handling** - Track delivery, opens, clicks, bounces
- **Handlebars Variables** - Dynamic content
- **Localization** - Multi-language support
- **Delivery Tracking** - Comprehensive status tracking
- **Cost Tracking** - Monitor provider costs

## Installation

```bash
pnpm add @sv-sdk/email
```

## Configuration

```bash
# Email provider (brevo, ses, mock)
EMAIL_PROVIDER=brevo
EMAIL_FROM=noreply@yourdomain.com

# Brevo
BREVO_API_KEY=your_api_key
BREVO_WEBHOOK_SECRET=your_webhook_secret

# Database and Redis (required)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## Usage

### Send Email

```typescript
import { sendEmail } from '@sv-sdk/email'

// Send email using queue
const result = await sendEmail('verification_email', 'user@example.com', {
  userName: 'John Doe',
  verificationUrl: 'https://app.example.com/verify?token=abc123',
})

if (result.success) {
  console.log('Email queued:', result.data.jobId)
}
```

### Send Immediate

```typescript
import { sendEmailImmediate } from '@sv-sdk/email'

// Bypass queue for critical emails
const result = await sendEmailImmediate('password_reset', 'user@example.com', {
  userName: 'John Doe',
  resetUrl: 'https://app.example.com/reset?token=xyz789',
  expiresIn: '1 hour',
})

if (result.success) {
  console.log('Email sent:', result.data.messageId)
}
```

### Available Templates

1. **verification_email** - Email verification
   - Variables: `userName`, `verificationUrl`

2. **password_reset** - Password reset
   - Variables: `userName`, `resetUrl`, `expiresIn`

3. **notification** - Generic notification
   - Variables: `subject`, `title`, `message`, `actionUrl?`, `actionText?`

### Get Email History

```typescript
import { getEmailHistory } from '@sv-sdk/email'

const history = await getEmailHistory(
  { recipient: 'user@example.com', status: 'delivered' },
  { page: 1, pageSize: 20 }
)

console.log(`Found ${history.pagination.totalCount} emails`)
```

### Email Statistics

```typescript
import { getEmailStats } from '@sv-sdk/email'

const stats = await getEmailStats()
// {
//   total: 1000,
//   sent: 950,
//   delivered: 920,
//   bounced: 15,
//   failed: 15,
//   opened: 450,
//   clicked: 120
// }

const deliveryRate = (stats.delivered / stats.total) * 100
const openRate = (stats.opened / stats.delivered) * 100
```

### Test Template

```typescript
import { testTemplate } from '@sv-sdk/email'

await testTemplate('verification_email', 'test@example.com', {
  userName: 'Test User',
  verificationUrl: 'https://example.com/verify?token=test',
})
```

## Creating Templates

Templates are stored in the database. Use the admin panel or create programmatically:

```typescript
import { db, emailTemplates } from '@sv-sdk/db-config'

await db.insert(emailTemplates).values({
  id: nanoid(),
  name: 'welcome_email',
  subject: 'Welcome to {{appName}}!',
  mjml: `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text>Welcome {{userName}}!</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `,
  variables: ['appName', 'userName'],
  locale: 'en',
  isActive: true,
})
```

## MJML Basics

MJML is a responsive email framework:

```mjml
<mjml>
  <mj-body>
    <mj-section background-color="#f0f0f0">
      <mj-column>
        <mj-text font-size="20px" color="#333">
          Hello {{userName}}!
        </mj-text>
        <mj-button href="{{actionUrl}}">
          Click Here
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

**Components**:
- `<mj-text>` - Text content
- `<mj-button>` - Call-to-action button
- `<mj-image>` - Images
- `<mj-divider>` - Horizontal line
- `<mj-spacer>` - Vertical spacing

**Resources**:
- [MJML Documentation](https://mjml.io/documentation/)
- [MJML Try It Live](https://mjml.io/try-it-live)

## Webhooks

Handle delivery events from email providers:

```typescript
import { processWebhook } from '@sv-sdk/email'

// In your webhook endpoint
export async function POST({ request }) {
  const signature = request.headers.get('x-brevo-signature')
  const payload = await request.json()

  await processWebhook(payload, signature, 'brevo')

  return new Response('OK')
}
```

**Webhook Events**:
- `delivered` - Email delivered successfully
- `bounced` - Email bounced
- `opened` - Recipient opened email
- `clicked` - Recipient clicked link
- `complained` - Marked as spam
- `unsubscribed` - Unsubscribed from emails

## Queue Management

The email queue automatically:
- ✅ Retries failed sends (3 attempts with exponential backoff)
- ✅ Removes old jobs (completed: 100, failed: 500)
- ✅ Handles high volume (>100 emails/second)
- ✅ Prioritizes urgent emails

```typescript
import { enqueueEmail } from '@sv-sdk/email'
import { QUEUE_PRIORITY } from '@sv-sdk/cache'

// High priority
await enqueueEmail('password_reset', to, variables, {
  priority: QUEUE_PRIORITY.HIGH,
})

// Delayed send
await enqueueEmail('reminder', to, variables, {
  delay: 24 * 60 * 60 * 1000, // 24 hours
})
```

## Localization

Templates support multiple languages:

```typescript
// Send in Spanish
await sendEmail('verification_email', to, variables, { locale: 'es' })

// Send in French
await sendEmail('verification_email', to, variables, { locale: 'fr' })
```

Create localized templates in database:

```sql
INSERT INTO email.email_templates (name, locale, subject, mjml, ...)
VALUES
  ('welcome', 'en', 'Welcome!', '<mjml>...</mjml>', ...),
  ('welcome', 'es', '¡Bienvenido!', '<mjml>...</mjml>', ...),
  ('welcome', 'fr', 'Bienvenue!', '<mjml>...</mjml>', ...);
```

## Performance

**Template Rendering**:
- < 100ms per email
- MJML compilation cached

**Queue Throughput**:
- > 100 emails/second
- Configurable concurrency

**Provider Latency**:
- Brevo: ~200-500ms
- Mock: ~10ms

## Best Practices

1. **Use Queue** - Always use queue for non-critical emails
2. **Test Templates** - Test before sending to users
3. **Monitor Metrics** - Track delivery and bounce rates
4. **Handle Bounces** - Remove bounced emails from lists
5. **Include Unsubscribe** - Required for marketing emails
6. **Warm Up Domain** - Start with low volume, increase gradually
7. **Authenticate Domain** - Configure SPF, DKIM, DMARC

## Email Authentication

Configure SPF, DKIM, and DMARC for better deliverability.

See [docs/email-auth.md](./docs/email-auth.md) for complete setup guide.

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Troubleshooting

### Emails Not Sending

1. Check provider configuration (API keys)
2. Verify Redis is running (queue requires Redis)
3. Check email worker is running
4. Review queue for failed jobs

### Templates Not Rendering

1. Verify template exists in database
2. Check template is active (`isActive = true`)
3. Validate MJML syntax
4. Check variable names match

### High Bounce Rate

1. Verify email addresses before sending
2. Remove bounced addresses from lists
3. Check domain authentication (SPF/DKIM/DMARC)
4. Review email content for spam triggers

## License

MIT

