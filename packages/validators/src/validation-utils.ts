/**
 * Validation utilities
 * Helper functions for validation and sanitization
 */

import { z, type ZodSchema } from 'zod'
import { ValidationError } from '@sv-sdk/shared'
import type { Result } from '@sv-sdk/shared'

/**
 * Validate request data against schema
 * Returns Result type for functional error handling
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): Result<T, ValidationError> {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return {
      success: false,
      error: new ValidationError('Validation failed', {
        errors,
        details: { zodErrors: result.error.errors },
      }),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodErrors(error: z.ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.join('.')
      return path ? `${path}: ${err.message}` : err.message
    })
    .join(', ')
}

/**
 * Sanitize HTML input to prevent XSS
 * Note: For production, use a library like DOMPurify
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize string for SQL LIKE queries
 */
export function sanitizeLikeQuery(input: string): string {
  return input
    .replace(/[%_\\]/g, '\\$&') // Escape special LIKE characters
    .trim()
}

/**
 * Email validator with lowercase normalization
 */
export const emailValidator = z
  .string()
  .email()
  .toLowerCase()
  .transform((email) => email.trim())

/**
 * URL validator
 */
export const urlValidator = z.string().url()

/**
 * UUID validator
 */
export const uuidValidator = z.string().uuid()

/**
 * Slug validator (URL-safe strings)
 */
export const slugValidator = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

/**
 * Phone number validator (basic)
 */
export const phoneValidator = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')

/**
 * Date range validator
 */
export const dateRangeValidator = z
  .object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .refine((data) => new Date(data.from) <= new Date(data.to), {
    message: 'From date must be before or equal to To date',
    path: ['from'],
  })

/**
 * Pagination validator
 */
export const paginationValidator = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

/**
 * Sort validator
 */
export const sortValidator = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

/**
 * Search validator
 */
export const searchValidator = z
  .string()
  .min(1, 'Search query must be at least 1 character')
  .max(500, 'Search query is too long')
  .transform(sanitizeLikeQuery)

/**
 * File upload validator
 */
export function createFileValidator(options: {
  maxSize?: number // In bytes
  allowedTypes?: string[] // MIME types
}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options // Default 5MB

  return z.object({
    name: z.string(),
    size: z.number().max(maxSize, `File size must be less than ${maxSize / 1024 / 1024}MB`),
    type: z.string().refine(
      (type) => {
        if (allowedTypes.length === 0) return true
        return allowedTypes.includes(type)
      },
      { message: `Allowed file types: ${allowedTypes.join(', ')}` }
    ),
  })
}

/**
 * Strip unknown fields from object
 * Useful for preventing mass-assignment vulnerabilities
 */
export function stripUnknownFields<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.parse(data)
  return result
}

/**
 * Create enum validator from array
 */
export function createEnumValidator<T extends string>(values: readonly T[]) {
  return z.enum(values as [T, ...T[]])
}

/**
 * Conditional validator
 * Apply different validation based on condition
 */
export function conditionalValidator<T>(
  condition: (data: any) => boolean,
  trueSchema: ZodSchema<T>,
  falseSchema: ZodSchema<T>
): ZodSchema<T> {
  return z.any().superRefine((data, ctx) => {
    const schema = condition(data) ? trueSchema : falseSchema
    const result = schema.safeParse(data)

    if (!result.success) {
      result.error.errors.forEach((error) => {
        ctx.addIssue(error)
      })
    }
  }) as ZodSchema<T>
}
