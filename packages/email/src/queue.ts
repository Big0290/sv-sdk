/**
 * Email queue using BullMQ
 */

import { createQueue, createWorker, QUEUE_NAMES, QUEUE_PRIORITY, type Job } from '@sv-sdk/cache'
import { db, emailSends } from '@sv-sdk/db-config'
import { renderTemplate } from './renderer.js'
import { getEmailProvider } from './providers/index.js'
import { logAudit } from '@sv-sdk/audit'
import { logger } from '@sv-sdk/shared'
import { nanoid } from 'nanoid'

/**
 * Email job data
 */
export interface EmailJob {
  templateName: string
  to: string
  variables: Record<string, any>
  locale?: string
  metadata?: Record<string, unknown>
}

/**
 * Email queue instance
 */
export const emailQueue = createQueue<EmailJob>(QUEUE_NAMES.EMAIL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 500,
      age: 7 * 24 * 3600,
    },
  },
})

/**
 * Enqueue email for sending
 */
export async function enqueueEmail(
  templateName: string,
  to: string,
  variables: Record<string, any>,
  options: {
    priority?: number
    delay?: number
    locale?: string
    metadata?: Record<string, unknown>
  } = {}
): Promise<string> {
  try {
    const job = await emailQueue.add(
      'send',
      {
        templateName,
        to,
        variables,
        locale: options.locale || 'en',
        metadata: options.metadata,
      },
      {
        priority: options.priority || QUEUE_PRIORITY.NORMAL,
        delay: options.delay,
      }
    )

    logger.info('Email queued', { jobId: job.id, templateName, to })

    // Create initial email send record
    await db.insert(emailSends).values({
      id: nanoid(),
      templateName,
      recipient: to,
      subject: 'Processing...', // Will be updated when sent
      status: 'queued',
      provider: 'pending',
      metadata: options.metadata || {},
    })

    return job.id!
  } catch (error) {
    logger.error('Failed to enqueue email', error as Error)
    throw error
  }
}

/**
 * Email queue worker
 */
export const emailWorker = createWorker<EmailJob>(QUEUE_NAMES.EMAIL, async (job: Job<EmailJob>) => {
  const { templateName, to, variables, locale, metadata } = job.data

  logger.info('Processing email job', { jobId: job.id, templateName, to })

  try {
    // 1. Render template
    const rendered = await renderTemplate(templateName, variables, locale)

    // 2. Get email provider
    const provider = getEmailProvider()

    // 3. Send email
    const result = await provider.send({
      to,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    })

    if (!result.success) {
      // Send failed
      await db.insert(emailSends).values({
        id: nanoid(),
        templateName,
        recipient: to,
        subject: rendered.subject,
        status: 'failed',
        provider: provider.name,
        failedAt: new Date(),
        errorMessage: result.error.message,
        metadata: metadata || {},
      })

      // Log failure
      await logAudit('email.failed', {
        templateName,
        recipient: to,
        error: result.error.message,
      })

      throw result.error
    }

    // 4. Record successful send
    await db.insert(emailSends).values({
      id: nanoid(),
      templateName,
      recipient: to,
      subject: rendered.subject,
      status: 'sent',
      provider: provider.name,
      messageId: result.data.messageId,
      sentAt: new Date(),
      metadata: metadata || {},
    })

    // 5. Log success
    await logAudit('email.sent', {
      templateName,
      recipient: to,
      messageId: result.data.messageId,
      provider: provider.name,
    })

    logger.info('Email sent successfully', {
      jobId: job.id,
      messageId: result.data.messageId,
      to,
    })

    return {
      success: true,
      messageId: result.data.messageId,
    }
  } catch (error) {
    logger.error('Email job failed', error as Error, { jobId: job.id })
    throw error
  }
})

logger.info('Email queue worker started')

