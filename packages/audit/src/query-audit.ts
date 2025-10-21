/**
 * Query audit logs with filters and pagination
 */

import { db, auditLogs, type AuditLog } from '@big0290/db-config'
import { eq, and, gte, lte, desc, asc } from '@big0290/db-config'
import {
  calculatePaginationMeta,
  calculateOffset,
  type PaginatedResponse,
  type PaginationParams,
} from '@big0290/shared'
import { logger, DatabaseError } from '@big0290/shared'

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  eventType?: string
  userId?: string
  ipAddress?: string
  dateFrom?: Date
  dateTo?: Date
  piiMasked?: boolean
  search?: string // Search in metadata (stringified JSON)
}

/**
 * Sort options for audit logs
 */
export interface AuditLogSort {
  field: 'createdAt' | 'eventType' | 'userId'
  order: 'asc' | 'desc'
}

/**
 * Fetch audit logs with filters and pagination
 */
export async function fetchAuditLogs(
  filters: AuditLogFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 },
  sort: AuditLogSort = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResponse<AuditLog>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []

    if (filters.eventType) {
      conditions.push(eq(auditLogs.eventType, filters.eventType))
    }

    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId))
    }

    if (filters.ipAddress) {
      conditions.push(eq(auditLogs.ipAddress, filters.ipAddress))
    }

    if (filters.dateFrom) {
      conditions.push(gte(auditLogs.createdAt, filters.dateFrom))
    }

    if (filters.dateTo) {
      conditions.push(lte(auditLogs.createdAt, filters.dateTo))
    }

    if (filters.piiMasked !== undefined) {
      conditions.push(eq(auditLogs.piiMasked, filters.piiMasked))
    }

    // Build query
    let query = db.select().from(auditLogs)

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where(and(...conditions)) as any
    }

    // Get total count
    const allResults = await query
    const totalCount = allResults.length

    // Apply sorting
    const sortColumn =
      sort.field === 'createdAt'
        ? auditLogs.createdAt
        : sort.field === 'eventType'
          ? auditLogs.eventType
          : auditLogs.userId

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (sort.order === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn))) as any

    // Apply pagination
    const offset = calculateOffset(pagination)
    const data = await query.limit(pagination.pageSize).offset(offset)

    const paginationMeta = calculatePaginationMeta(pagination, totalCount)

    logger.debug('Audit logs fetched', { count: data.length, filters, pagination })

    return {
      data,
      pagination: paginationMeta,
    }
  } catch (error) {
    logger.error('Failed to fetch audit logs', error as Error)
    throw new DatabaseError('Failed to fetch audit logs', { cause: error as Error })
  }
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  try {
    const result = await db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0] || null
  } catch (error) {
    logger.error('Failed to get audit log by ID', error as Error, { id })
    return null
  }
}

/**
 * Export audit logs to JSON
 */
export async function exportAuditLogsJSON(filters: AuditLogFilters = {}): Promise<string> {
  try {
    // Get all logs matching filters (no pagination)
    const result = await fetchAuditLogs(filters, { page: 1, pageSize: 10000 })

    const exported = {
      exportedAt: new Date().toISOString(),
      filters,
      count: result.data.length,
      logs: result.data,
    }

    return JSON.stringify(exported, null, 2)
  } catch (error) {
    logger.error('Failed to export audit logs to JSON', error as Error)
    throw error
  }
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogsCSV(filters: AuditLogFilters = {}): Promise<string> {
  try {
    const result = await fetchAuditLogs(filters, { page: 1, pageSize: 10000 })

    const headers = ['ID', 'Event Type', 'User ID', 'IP Address', 'User Agent', 'PII Masked', 'Created At', 'Metadata']

    const rows = result.data.map((log) => [
      log.id,
      log.eventType,
      log.userId || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.piiMasked ? 'Yes' : 'No',
      log.createdAt.toISOString(),
      JSON.stringify(log.metadata),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(cell).replace(/"/g, '""')
            return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped
          })
          .join(',')
      ),
    ].join('\n')

    return csv
  } catch (error) {
    logger.error('Failed to export audit logs to CSV', error as Error)
    throw error
  }
}

/**
 * Search audit logs by metadata
 * Performs full-text search in metadata JSON
 */
export async function searchAuditLogs(
  searchQuery: string,
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<PaginatedResponse<AuditLog>> {
  try {
    // Note: This is a basic implementation
    // For production, use PostgreSQL's full-text search or JSON search operators

    const allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt))

    const searchLower = searchQuery.toLowerCase()

    const filtered = allLogs.filter((log) => {
      const metadataStr = JSON.stringify(log.metadata).toLowerCase()
      return (
        metadataStr.includes(searchLower) ||
        log.eventType.toLowerCase().includes(searchLower) ||
        log.userId?.toLowerCase().includes(searchLower) ||
        log.ipAddress?.toLowerCase().includes(searchLower)
      )
    })

    const totalCount = filtered.length
    const offset = calculateOffset(pagination)
    const data = filtered.slice(offset, offset + pagination.pageSize)

    const paginationMeta = calculatePaginationMeta(pagination, totalCount)

    return {
      data,
      pagination: paginationMeta,
    }
  } catch (error) {
    logger.error('Failed to search audit logs', error as Error)
    throw new DatabaseError('Failed to search audit logs', { cause: error as Error })
  }
}

/**
 * Count audit logs by event type
 */
export async function countByEventType(): Promise<Record<string, number>> {
  try {
    const logs = await db.select().from(auditLogs)

    const counts: Record<string, number> = {}

    for (const log of logs) {
      counts[log.eventType] = (counts[log.eventType] || 0) + 1
    }

    return counts
  } catch (error) {
    logger.error('Failed to count audit logs by event type', error as Error)
    return {}
  }
}
