/**
 * Email service
 * High-level email operations
 */

import { enqueueEmail } from './queue.js'
import { renderTemplate, previewTemplate } from './renderer.js'
import { getEmailProvider } from './providers/index.js'
import { db, emailTemplates, emailSends } from '@sv-sdk/db-config'
import { eq, desc } from 'drizzle-orm'
import { logger, type Result, ok, err } from '@sv-sdk/shared'
import type { PaginatedResponse, PaginationParams } from '@sv-sdk/shared'
import { calculatePaginationMeta, calculateOffset } from '@sv-sdk/shared'

/**
 * Send email using queue
 */
export async function sendEmail(
  templateName: string,
  to: string,
  variables: Record<string, any>,
  options: {
    priority?: number
    delay?: number
    locale?: string
  } = {}
): Promise<Result<{ jobId: string }, Error>> {
  try {
    const jobId = await enqueueEmail(templateName, to, variables, options)

    logger.info('Email queued for sending', { templateName, to, jobId })

    return ok({ jobId })
  } catch (error) {
    logger.error('Failed to send email', error as Error)
    return err(error as Error)
  }
}

/**
 * Send email immediately (bypass queue)
 * Use for critical/time-sensitive emails
 */
export async function sendEmailImmediate(
  templateName: string,
  to: string,
  variables: Record<string, any>,
  locale: string = 'en'
): Promise<Result<{ messageId: string }, Error>> {
  try {
    // Render template
    const rendered = await renderTemplate(templateName, variables, locale)

    // Get provider
    const provider = getEmailProvider()

    // Send immediately
    const result = await provider.send({
      to,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    })

    if (!result.success) {
      return err(result.error)
    }

    logger.info('Email sent immediately', { messageId: result.data.messageId, to })

    return ok({ messageId: result.data.messageId })
  } catch (error) {
    logger.error('Failed to send immediate email', error as Error)
    return err(error as Error)
  }
}

/**
 * Get email send history
 */
export async function getEmailHistory(
  filters: {
    recipient?: string
    templateName?: string
    status?: string
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<PaginatedResponse<any>> {
  try {
    const conditions = []

    if (filters.recipient) {
      conditions.push(eq(emailSends.recipient, filters.recipient))
    }

    if (filters.templateName) {
      conditions.push(eq(emailSends.templateName, filters.templateName))
    }

    if (filters.status) {
      conditions.push(eq(emailSends.status, filters.status))
    }

    let query = db.select().from(emailSends)

    if (conditions.length > 0) {
      query = query.where(eq(emailSends.recipient, filters.recipient!)) as any
    }

    const allResults = await query
    const totalCount = allResults.length

    const offset = calculateOffset(pagination)
    const data = await query.limit(pagination.pageSize).offset(offset).orderBy(desc(emailSends.createdAt))

    const paginationMeta = calculatePaginationMeta(pagination, totalCount)

    return {
      data,
      pagination: paginationMeta,
    }
  } catch (error) {
    logger.error('Failed to get email history', error as Error)
    throw error
  }
}

/**
 * Get email statistics
 */
export async function getEmailStats(): Promise<{
  total: number
  queued: number
  sent: number
  delivered: number
  bounced: number
  failed: number
  opened: number
  clicked: number
}> {
  try {
    const sends = await db.select().from(emailSends)

    const stats = {
      total: sends.length,
      queued: 0,
      sent: 0,
      delivered: 0,
      bounced: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
    }

    for (const send of sends) {
      if (send.status === 'queued') stats.queued++
      if (send.status === 'sent') stats.sent++
      if (send.status === 'delivered') stats.delivered++
      if (send.status === 'bounced') stats.bounced++
      if (send.status === 'failed') stats.failed++
      if (send.openedAt) stats.opened++
      if (send.clickedAt) stats.clicked++
    }

    return stats
  } catch (error) {
    logger.error('Failed to get email stats', error as Error)
    throw error
  }
}

/**
 * Test email template
 */
export async function testTemplate(
  templateName: string,
  testRecipient: string,
  sampleVariables: Record<string, any>
): Promise<Result<{ messageId: string }, Error>> {
  try {
    // Preview first to validate
    await previewTemplate(templateName, sampleVariables)

    // Send test email
    return sendEmailImmediate(templateName, testRecipient, sampleVariables)
  } catch (error) {
    logger.error('Template test failed', error as Error)
    return err(error as Error)
  }
}

