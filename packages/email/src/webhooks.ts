/**
 * Email webhook handlers
 * Process delivery status updates from email providers
 */

import { db, emailSends, emailWebhooks } from '@sv-sdk/db-config'
import { eq } from '@sv-sdk/db-config'
import { getEmailProvider } from './providers/index.js'
import { logAudit } from '@sv-sdk/audit'
import { logger } from '@sv-sdk/shared'
import { nanoid } from 'nanoid'
import type { WebhookEvent } from './providers/types.js'

/**
 * Process webhook event
 */
export async function processWebhook(payload: unknown, signature: string, provider: string = 'brevo'): Promise<void> {
  try {
    // Get provider and verify webhook
    const emailProvider = getEmailProvider()

    if (emailProvider.name !== provider) {
      logger.warn('Webhook provider mismatch', { expected: provider, actual: emailProvider.name })
    }

    // Verify signature and parse event
    const event: WebhookEvent = emailProvider.verifyWebhook(payload, signature)

    logger.info('Webhook received', {
      provider: event.provider,
      eventType: event.eventType,
      messageId: event.messageId,
      recipient: event.recipient,
    })

    // Store webhook event
    await db.insert(emailWebhooks).values({
      id: nanoid(),
      provider: event.provider,
      eventType: event.eventType,
      messageId: event.messageId,
      recipient: event.recipient,
      payload: event.metadata || {},
      processed: false,
    })

    // Update email send record
    await updateEmailStatus(event)

    // Mark webhook as processed
    await db
      .update(emailWebhooks)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(emailWebhooks.messageId, event.messageId))

    // Log event
    await logAudit(`email.${event.eventType}`, {
      messageId: event.messageId,
      recipient: event.recipient,
      provider: event.provider,
    })
  } catch (error) {
    logger.error('Webhook processing failed', error as Error)
    throw error
  }
}

/**
 * Update email send status based on webhook event
 */
async function updateEmailStatus(event: WebhookEvent): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      updatedAt: new Date(),
    }

    switch (event.eventType) {
      case 'delivered':
        updates.status = 'delivered'
        updates.deliveredAt = event.timestamp
        break

      case 'bounced':
        updates.status = 'bounced'
        updates.failedAt = event.timestamp
        updates.errorMessage = 'Email bounced'
        break

      case 'opened':
        updates.openedAt = event.timestamp
        break

      case 'clicked':
        updates.clickedAt = event.timestamp
        break

      case 'complained':
        updates.status = 'bounced'
        updates.failedAt = event.timestamp
        updates.errorMessage = 'Spam complaint'
        break

      case 'unsubscribed':
        // Handle unsubscribe separately
        await handleUnsubscribe(event.recipient)
        break
    }

    if (event.messageId) {
      await db.update(emailSends).set(updates).where(eq(emailSends.messageId, event.messageId))

      logger.debug('Email status updated', { messageId: event.messageId, status: updates.status })
    }
  } catch (error) {
    logger.error('Failed to update email status', error as Error)
  }
}

/**
 * Handle unsubscribe event
 */
async function handleUnsubscribe(recipient: string): Promise<void> {
  try {
    // Update email preferences
    // This will be fully implemented when preferences table is set up

    logger.info('Unsubscribe processed', { recipient })

    await logAudit('email.unsubscribed', { recipient })
  } catch (error) {
    logger.error('Failed to handle unsubscribe', error as Error)
  }
}

/**
 * Get unprocessed webhooks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUnprocessedWebhooks(limit: number = 100): Promise<any[]> {
  try {
    const result = await db.select().from(emailWebhooks).where(eq(emailWebhooks.processed, false)).limit(limit)

    return result
  } catch (error) {
    logger.error('Failed to get unprocessed webhooks', error as Error)
    return []
  }
}

/**
 * Retry webhook processing
 */
export async function retryWebhookProcessing(webhookId: string): Promise<void> {
  try {
    const webhook = await db.select().from(emailWebhooks).where(eq(emailWebhooks.id, webhookId)).limit(1)

    if (webhook.length === 0) {
      throw new Error('Webhook not found')
    }

    const event = webhook[0]
    if (!event) {
      return
    }

    // Reconstruct webhook event
    const webhookEvent: WebhookEvent = {
      provider: event.provider,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eventType: event.eventType as any,
      messageId: event.messageId || '',
      recipient: event.recipient || '',
      timestamp: event.createdAt,
      metadata: event.payload as Record<string, unknown>,
    }

    // Update status
    await updateEmailStatus(webhookEvent)

    // Mark as processed
    await db
      .update(emailWebhooks)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(emailWebhooks.id, webhookId))

    logger.info('Webhook reprocessed', { webhookId })
  } catch (error) {
    logger.error('Failed to retry webhook processing', error as Error)
    throw error
  }
}
