/**
 * Email provider types and interfaces
 */

import type { Result } from '@big0290/shared'

/**
 * Email message to send
 */
export interface EmailMessage {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

/**
 * Email send result
 */
export interface EmailResult {
  messageId: string
  provider: string
  timestamp: Date
  accepted?: string[]
  rejected?: string[]
}

/**
 * Delivery status
 */
export interface DeliveryStatus {
  messageId: string
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked'
  timestamp: Date
  error?: string
  metadata?: Record<string, unknown>
}

/**
 * Webhook event from email provider
 */
export interface WebhookEvent {
  provider: string
  eventType: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'unsubscribed'
  messageId: string
  recipient: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Email provider interface
 * All providers must implement this interface
 */
export interface EmailProvider {
  /**
   * Provider name
   */
  readonly name: string

  /**
   * Send email
   */
  send(email: EmailMessage): Promise<Result<EmailResult, Error>>

  /**
   * Verify webhook signature and parse event
   */
  verifyWebhook(payload: unknown, signature: string): WebhookEvent

  /**
   * Get delivery status for message
   */
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>

  /**
   * Test provider configuration
   */
  test(): Promise<boolean>
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  type: 'brevo' | 'ses' | 'mock'
  apiKey?: string
  region?: string
  webhookSecret?: string
}
