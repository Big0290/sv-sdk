/**
 * Email DTOs - Validation schemas for email operations
 */

import { z } from 'zod'
import { insertEmailTemplateSchema, insertEmailSendSchema } from '@sv-sdk/db-config'

/**
 * Send email request schema
 */
export const sendEmailRequestSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  recipient: z.string().email('Invalid recipient email'),
  variables: z.record(z.any()).default({}),
  priority: z.number().int().min(1).max(10).optional().default(5),
  delay: z.number().int().min(0).optional(), // Delay in milliseconds
  locale: z.string().optional().default('en'),
})

export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>

/**
 * Bulk send email request schema
 */
export const bulkSendEmailRequestSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  recipients: z
    .array(
      z.object({
        email: z.string().email('Invalid email'),
        variables: z.record(z.any()).default({}),
      })
    )
    .min(1, 'At least one recipient is required')
    .max(1000, 'Maximum 1000 recipients per batch'),
  priority: z.number().int().min(1).max(10).optional().default(5),
  locale: z.string().optional().default('en'),
})

export type BulkSendEmailRequest = z.infer<typeof bulkSendEmailRequestSchema>

/**
 * Create template request schema
 */
export const createTemplateRequestSchema = insertEmailTemplateSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    version: true,
  })
  .extend({
    name: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9_]+$/, 'Template name must be lowercase alphanumeric with underscores'),
    subject: z.string().min(1).max(500),
    mjml: z.string().min(1),
    variables: z.array(z.string()).default([]),
    locale: z.string().default('en'),
    description: z.string().max(500).optional(),
  })

export type CreateTemplateRequest = z.infer<typeof createTemplateRequestSchema>

/**
 * Update template request schema
 */
export const updateTemplateRequestSchema = createTemplateRequestSchema.partial().omit({
  name: true, // Name cannot be changed
})

export type UpdateTemplateRequest = z.infer<typeof updateTemplateRequestSchema>

/**
 * Test send request schema
 */
export const testSendRequestSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  recipient: z.string().email('Invalid recipient email'),
  variables: z.record(z.any()).default({}),
})

export type TestSendRequest = z.infer<typeof testSendRequestSchema>

/**
 * Email query filters
 */
export const emailQuerySchema = z.object({
  status: z.enum(['queued', 'sent', 'delivered', 'bounced', 'failed']).optional(),
  recipient: z.string().email().optional(),
  templateName: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export type EmailQuery = z.infer<typeof emailQuerySchema>

/**
 * Email preferences update schema
 */
export const emailPreferencesUpdateSchema = z.object({
  marketing: z.boolean().optional(),
  transactional: z.boolean().optional(),
  notifications: z.boolean().optional(),
})

export type EmailPreferencesUpdate = z.infer<typeof emailPreferencesUpdateSchema>

/**
 * Unsubscribe schema
 */
export const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token is required'),
  reason: z.string().max(500).optional(),
})

export type Unsubscribe = z.infer<typeof unsubscribeSchema>
