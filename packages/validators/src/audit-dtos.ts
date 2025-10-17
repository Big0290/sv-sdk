/**
 * Audit DTOs - Validation schemas for audit operations
 */

import { z } from 'zod'

/**
 * Log query request schema
 */
export const logQueryRequestSchema = z.object({
  eventType: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional(),
  search: z.string().optional(), // Full-text search in metadata
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'eventType', 'userId']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type LogQueryRequest = z.infer<typeof logQueryRequestSchema>

/**
 * Audit export request schema
 */
export const auditExportRequestSchema = z.object({
  eventType: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  format: z.enum(['csv', 'json']).default('json'),
  includePii: z.boolean().default(false), // Requires special permission
})

export type AuditExportRequest = z.infer<typeof auditExportRequestSchema>

/**
 * Audit retention update schema
 */
export const auditRetentionUpdateSchema = z.object({
  retentionDays: z.number().int().min(1).max(36500), // Max 100 years
  enableAutoArchive: z.boolean().default(true),
  archiveBeforeDays: z.number().int().min(1).optional(), // Archive N days before deletion
})

export type AuditRetentionUpdate = z.infer<typeof auditRetentionUpdateSchema>

/**
 * Log audit event schema (for manual logging)
 */
export const logAuditEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  userId: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  metadata: z.record(z.any()).default({}),
})

export type LogAuditEvent = z.infer<typeof logAuditEventSchema>
