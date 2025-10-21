/**
 * AWS SES email provider
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { EmailProvider, EmailMessage, EmailResult, WebhookEvent } from './types.js'
import { logger, ok, err } from '@sv-sdk/shared'

/**
 * AWS SES Provider
 */
export class SESProvider implements EmailProvider {
  name = 'ses' as const
  private client: SESClient

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1'

    this.client = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })

    logger.info('AWS SES provider initialized', { region })
  }

  async send(message: EmailMessage): Promise<import('@sv-sdk/shared').Result<EmailResult, Error>> {
    try {
      const command = new SendEmailCommand({
        Source: message.from,
        Destination: {
          ToAddresses: [message.to],
        },
        Message: {
          Subject: {
            Data: message.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: message.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: message.text,
              Charset: 'UTF-8',
            },
          },
        },
      })

      const response = await this.client.send(command)

      logger.info('Email sent via SES', {
        messageId: response.MessageId,
        to: message.to,
      })

      return ok({
        messageId: response.MessageId || 'unknown',
        provider: this.name,
      })
    } catch (error) {
      logger.error('Failed to send email via SES', error as Error, {
        to: message.to,
        subject: message.subject,
      })

      return err(error as Error)
    }
  }

  verifyWebhook(payload: unknown): WebhookEvent {
    // AWS SES uses SNS for webhooks
    // This is a simplified implementation - would need SNS message verification

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = payload as any

    return {
      provider: this.name,
      eventType: this.mapSESEventType(event.notificationType),
      messageId: event.mail?.messageId || '',
      recipient: event.mail?.destination?.[0] || '',
      timestamp: new Date(event.mail?.timestamp || Date.now()),
      metadata: event,
    }
  }

  private mapSESEventType(type: string): WebhookEvent['eventType'] {
    const mapping: Record<string, WebhookEvent['eventType']> = {
      Delivery: 'delivered',
      Bounce: 'bounced',
      Complaint: 'complained',
      Reject: 'bounced',
    }

    return mapping[type] || 'delivered'
  }
}

/**
 * Create SES provider instance
 */
export function createSESProvider(): SESProvider {
  return new SESProvider()
}
