/**
 * Mock email provider for development and testing
 */

import fs from 'fs/promises'
import path from 'path'
import { logger, ok, err, type Result } from '@big0290/shared'
import type { EmailProvider, EmailMessage, EmailResult, WebhookEvent, DeliveryStatus } from './types.js'

/**
 * Mock provider implementation
 * Saves emails to filesystem for preview
 */
export class MockProvider implements EmailProvider {
  readonly name = 'mock'
  private outputDir: string

  constructor(outputDir: string = './emails') {
    this.outputDir = outputDir
    logger.info('Mock email provider initialized', { outputDir })
  }

  /**
   * Send email (saves to file)
   */
  async send(email: EmailMessage): Promise<Result<EmailResult, Error>> {
    try {
      const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`

      // Log to console
      logger.info('📧 Mock Email Sent', {
        to: email.to,
        from: email.from,
        subject: email.subject,
        messageId,
      })

      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true })

      // Save HTML version
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${timestamp}-${email.to.replace(/[^a-zA-Z0-9]/g, '_')}.html`
      const filepath = path.join(this.outputDir, filename)

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${email.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    .metadata { background: #f0f0f0; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    .metadata-row { margin: 5px 0; }
    .label { font-weight: bold; }
    .content { border: 1px solid #ddd; padding: 20px; }
  </style>
</head>
<body>
  <div class="metadata">
    <div class="metadata-row"><span class="label">To:</span> ${email.to}</div>
    <div class="metadata-row"><span class="label">From:</span> ${email.from}</div>
    <div class="metadata-row"><span class="label">Subject:</span> ${email.subject}</div>
    <div class="metadata-row"><span class="label">Message ID:</span> ${messageId}</div>
    <div class="metadata-row"><span class="label">Timestamp:</span> ${new Date().toISOString()}</div>
  </div>
  <div class="content">
    ${email.html}
  </div>
  ${
    email.text
      ? `
  <details style="margin-top: 20px;">
    <summary>Plain Text Version</summary>
    <pre style="background: #f5f5f5; padding: 15px; overflow-x: auto;">${email.text}</pre>
  </details>
  `
      : ''
  }
</body>
</html>
      `.trim()

      await fs.writeFile(filepath, htmlContent)

      logger.info('Mock email saved', { path: filepath })

      return ok({
        messageId,
        provider: this.name,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error('Mock provider send failed', error as Error)
      return err(error as Error)
    }
  }

  /**
   * Verify webhook (mock implementation)
   */
  verifyWebhook(payload: unknown): WebhookEvent {
    // Mock provider doesn't validate signatures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = payload as any

    return {
      provider: this.name,
      eventType: event.eventType || 'delivered',
      messageId: event.messageId || '',
      recipient: event.recipient || '',
      timestamp: new Date(),
      metadata: event,
    }
  }

  /**
   * Get delivery status (mock)
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    return {
      messageId,
      status: 'delivered',
      timestamp: new Date(),
    }
  }

  /**
   * Test provider
   */
  async test(): Promise<boolean> {
    try {
      await fs.access(this.outputDir)
      return true
    } catch {
      // Try to create directory
      try {
        await fs.mkdir(this.outputDir, { recursive: true })
        return true
      } catch {
        return false
      }
    }
  }
}

/**
 * Create mock provider
 */
export function createMockProvider(outputDir?: string): MockProvider {
  return new MockProvider(outputDir)
}
