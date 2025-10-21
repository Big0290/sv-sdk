/**
 * Audit logging functions
 * Append-only audit trail with PII masking
 */

import { db, auditLogs, type NewAuditLog } from '@big0290/db-config'
import { maskPII } from './pii-handler.js'
import { generateHash } from './integrity.js'
import { logger } from '@big0290/shared'
import { nanoid } from 'nanoid'

/**
 * Audit log options
 */
export interface AuditLogOptions {
  /**
   * Automatically mask PII in metadata
   */
  maskPII?: boolean

  /**
   * Skip integrity hash generation (for performance)
   */
  skipHash?: boolean

  /**
   * Batch this log (will be written later)
   */
  batch?: boolean
}

/**
 * Batch buffer for audit logs
 */
let batchBuffer: NewAuditLog[] = []
let batchTimeout: NodeJS.Timeout | null = null
const BATCH_SIZE = 100
const BATCH_INTERVAL_MS = 5000 // 5 seconds

/**
 * Log audit event
 */
export async function logAudit(
  eventType: string,
  metadata: Record<string, unknown> = {},
  options: AuditLogOptions = {}
): Promise<void> {
  try {
    const { maskPII: shouldMaskPII = true, skipHash = false, batch = false } = options

    // Prepare metadata
    let processedMetadata = metadata
    let piiMasked = false

    if (shouldMaskPII) {
      const masked = maskPII(metadata)
      processedMetadata = masked.data
      piiMasked = masked.masked
    }

    // Extract context
    const userId = (metadata.userId as string) || null
    const ipAddress = (metadata.ipAddress as string) || null
    const userAgent = (metadata.userAgent as string) || null

    // Generate hash for integrity
    const hash = skipHash ? '' : await generateHash(eventType, processedMetadata)

    // Create log entry
    const logEntry: NewAuditLog = {
      id: nanoid(),
      eventType,
      userId,
      ipAddress,
      userAgent,
      metadata: processedMetadata,
      piiMasked,
      hash,
    }

    // Write to database or batch
    if (batch) {
      batchBuffer.push(logEntry)

      // Flush if buffer full
      if (batchBuffer.length >= BATCH_SIZE) {
        await flushBatch()
      } else {
        // Set timeout for next flush
        if (!batchTimeout) {
          batchTimeout = setTimeout(flushBatch, BATCH_INTERVAL_MS)
        }
      }
    } else {
      // Write immediately
      await db.insert(auditLogs).values(logEntry)
      logger.debug('Audit log written', { eventType, userId: userId || undefined })
    }
  } catch (error) {
    // Don't throw - audit logging failures should not break application
    logger.error('Failed to log audit event', error as Error, { eventType })
  }
}

/**
 * Flush batched audit logs
 */
export async function flushBatch(): Promise<void> {
  if (batchBuffer.length === 0) {
    return
  }

  try {
    const toWrite = [...batchBuffer]
    batchBuffer = []

    // Clear timeout
    if (batchTimeout) {
      clearTimeout(batchTimeout)
      batchTimeout = null
    }

    // Bulk insert
    await db.insert(auditLogs).values(toWrite)

    logger.debug('Batch audit logs written', { count: toWrite.length })
  } catch (error) {
    logger.error('Failed to flush batch audit logs', error as Error)
  }
}

/**
 * Log multiple events at once
 */
export async function logAuditBulk(
  events: Array<{
    eventType: string
    metadata?: Record<string, unknown>
    options?: AuditLogOptions
  }>
): Promise<void> {
  try {
    const logEntries: NewAuditLog[] = []

    for (const event of events) {
      const { eventType, metadata = {}, options = {} } = event
      const { maskPII: shouldMaskPII = true, skipHash = false } = options

      let processedMetadata = metadata
      let piiMasked = false

      if (shouldMaskPII) {
        const masked = maskPII(metadata)
        processedMetadata = masked.data
        piiMasked = masked.masked
      }

      const userId = (metadata.userId as string) || null
      const ipAddress = (metadata.ipAddress as string) || null
      const userAgent = (metadata.userAgent as string) || null

      const hash = skipHash ? '' : await generateHash(eventType, processedMetadata)

      logEntries.push({
        id: nanoid(),
        eventType,
        userId,
        ipAddress,
        userAgent,
        metadata: processedMetadata,
        piiMasked,
        hash,
      })
    }

    await db.insert(auditLogs).values(logEntries)

    logger.debug('Bulk audit logs written', { count: logEntries.length })
  } catch (error) {
    logger.error('Failed to log bulk audit events', error as Error)
  }
}

/**
 * Graceful shutdown - flush remaining batched logs
 */
export async function shutdownAuditLogger(): Promise<void> {
  await flushBatch()
  logger.info('Audit logger shut down, all batches flushed')
}
