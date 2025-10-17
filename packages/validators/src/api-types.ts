/**
 * API response types
 * Standardized response structures for all API endpoints
 */

import { z } from 'zod'

/**
 * Successful API response
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    requestId?: string
    timestamp: string
    version?: string
  }
}

/**
 * Error API response
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    field?: string // For field-specific validation errors
    details?: Record<string, unknown>
  }
  meta?: {
    requestId?: string
    timestamp: string
    version?: string
  }
}

/**
 * Combined API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[]
  pagination: {
    nextCursor?: string
    previousCursor?: string
    hasMore: boolean
    limit: number
  }
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  total: number
  successful: number
  failed: number
  errors?: Array<{
    index: number
    error: string
  }>
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(data: T, meta?: ApiSuccessResponse<T>['meta']): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

/**
 * Helper to create error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  options?: {
    field?: string
    details?: Record<string, unknown>
    requestId?: string
  }
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      field: options?.field,
      details: options?.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options?.requestId,
    },
  }
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination']
): PaginatedResponse<T> {
  return {
    data,
    pagination,
  }
}

/**
 * Zod schemas for API responses (for validation)
 */
export const apiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        requestId: z.string().optional(),
        timestamp: z.string(),
        version: z.string().optional(),
      })
      .optional(),
  })

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    details: z.record(z.any()).optional(),
  }),
  meta: z
    .object({
      requestId: z.string().optional(),
      timestamp: z.string(),
      version: z.string().optional(),
    })
    .optional(),
})

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      totalPages: z.number(),
      totalCount: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  })
