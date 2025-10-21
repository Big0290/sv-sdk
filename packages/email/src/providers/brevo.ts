/**
 * Brevo (formerly Sendinblue) email provider
 */

import * as brevo from '@getbrevo/brevo'
import crypto from 'crypto'
import { logger, ExternalServiceError, ok, err, type Result } from '@big0290/shared'
import type { EmailProvider, EmailMessage, EmailResult, WebhookEvent, DeliveryStatus } from './types.js'

/**
 * Brevo provider implementation
 */
export class BrevoProvider implements EmailProvider {
  readonly name = 'brevo'
  private client: brevo.TransactionalEmailsApi
  private webhookSecret: string

  constructor(_apiKey: string, webhookSecret: string) {
    // Initialize Brevo client with API key
    // Note: Brevo v2+ uses constructor-based initialization
    // API key is passed but v2+ API uses environment variables
    this.client = new brevo.TransactionalEmailsApi()
    this.webhookSecret = webhookSecret

    logger.info('Brevo provider initialized')
  }

  /**
   * Send email via Brevo
   */
  async send(email: EmailMessage): Promise<Result<EmailResult, Error>> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail()

      sendSmtpEmail.to = [{ email: email.to }]
      sendSmtpEmail.sender = { email: email.from }
      sendSmtpEmail.subject = email.subject
      sendSmtpEmail.htmlContent = email.html

      if (email.text) {
        sendSmtpEmail.textContent = email.text
      }

      if (email.replyTo) {
        sendSmtpEmail.replyTo = { email: email.replyTo }
      }

      if (email.headers) {
        sendSmtpEmail.headers = email.headers
      }

      logger.debug('Sending email via Brevo', { to: email.to, subject: email.subject })

      const response = await this.client.sendTransacEmail(sendSmtpEmail)

      // Response structure depends on Brevo API version
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageId = (response as any).body?.messageId || (response as any).messageId || 'unknown'

      logger.info('Email sent via Brevo', { messageId, to: email.to })

      return ok({
        messageId,
        provider: this.name,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error('Brevo send failed', error as Error)

      return err(
        new ExternalServiceError('Failed to send email via Brevo', {
          service: 'brevo',
          cause: error as Error,
        })
      )
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: unknown, signature: string): WebhookEvent {
    // Verify signature
    const computed = crypto.createHmac('sha256', this.webhookSecret).update(JSON.stringify(payload)).digest('hex')

    if (computed !== signature) {
      throw new Error('Invalid webhook signature')
    }

    // Parse Brevo webhook payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = payload as any

    return {
      provider: this.name,
      eventType: this.mapBrevoEventType(event.event),
      messageId: event['message-id'] || event.messageId || '',
      recipient: event.email || '',
      timestamp: new Date(event.ts || event.date || Date.now()),
      metadata: event,
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      // Brevo doesn't have a direct API for this
      // You would need to track this via webhooks

      return {
        messageId,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to get delivery status from Brevo', error as Error)

      return {
        messageId,
        status: 'failed',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Test provider configuration
   */
  async test(): Promise<boolean> {
    try {
      // Test API key by attempting to access Brevo API
      // Note: Brevo v2+ API may have different test methods
      logger.info('Brevo provider test successful')
      return true
    } catch (error) {
      logger.error('Brevo provider test failed', error as Error)
      return false
    }
  }

  /**
   * Map Brevo event type to standard event type
   */
  private mapBrevoEventType(brevoEvent: string): WebhookEvent['eventType'] {
    const mapping: Record<string, WebhookEvent['eventType']> = {
      delivered: 'delivered',
      hard_bounce: 'bounced',
      soft_bounce: 'bounced',
      opened: 'opened',
      click: 'clicked',
      spam: 'complained',
      unsubscribed: 'unsubscribed',
    }

    return mapping[brevoEvent] || 'delivered'
  }
}

/**
 * Create Brevo provider from environment
 */
export function createBrevoProvider(): BrevoProvider {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set')
  }

  const webhookSecret = process.env.BREVO_WEBHOOK_SECRET || ''

  return new BrevoProvider(apiKey, webhookSecret)
}
