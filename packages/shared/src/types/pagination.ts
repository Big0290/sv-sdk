/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  nextCursor?: string
  previousCursor?: string
  hasMore: boolean
  limit: number
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[]
  pagination: CursorPaginationMeta
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(params: PaginationParams, totalCount: number): PaginationMeta {
  const { page, pageSize } = params
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    page,
    pageSize,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(params: PaginationParams): number {
  const { page, pageSize } = params
  return (page - 1) * pageSize
}

/**
 * Default pagination parameters
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
