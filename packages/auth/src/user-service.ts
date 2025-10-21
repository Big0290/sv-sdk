/**
 * User service
 * CRUD operations for users with caching
 */

import { db, users, type User, type NewUser } from '@sv-sdk/db-config'
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS, CACHE_TTL } from '@sv-sdk/cache'
import { eq, like, and, or, desc } from '@sv-sdk/db-config'
import { NotFoundError, DatabaseError, logger } from '@sv-sdk/shared'
import type { PaginationParams, PaginatedResponse } from '@sv-sdk/shared'
import { calculatePaginationMeta, calculateOffset } from '@sv-sdk/shared'

/**
 * User filters
 */
export interface UserFilters {
  email?: string
  role?: string
  isActive?: boolean
  search?: string // Search in name or email
}

/**
 * Get users with filters and pagination
 */
export async function getUsers(
  filters: UserFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<PaginatedResponse<User>> {
  try {
    const conditions = []

    if (filters.email) {
      conditions.push(eq(users.email, filters.email))
    }

    if (filters.role) {
      conditions.push(eq(users.role, filters.role))
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive))
    }

    if (filters.search) {
      conditions.push(or(like(users.email, `%${filters.search}%`), like(users.name, `%${filters.search}%`)))
    }

    // Build query
    let query = db.select().from(users)

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where(and(...conditions)) as any
    }

    // Get total count
    const totalCount = (await query).length // Simple count, optimize for large datasets

    // Apply pagination
    const offset = calculateOffset(pagination)
    const data = await query.limit(pagination.pageSize).offset(offset).orderBy(desc(users.createdAt))

    const paginationMeta = calculatePaginationMeta(pagination, totalCount)

    logger.debug('Users fetched', { count: data.length, filters, pagination })

    return {
      data,
      pagination: paginationMeta,
    }
  } catch (error) {
    logger.error('Failed to get users', error as Error)
    throw new DatabaseError('Failed to fetch users', { cause: error as Error })
  }
}

/**
 * Get user by ID with caching
 */
export async function getUserById(id: string, useCache: boolean = true): Promise<User | null> {
  try {
    // Check cache first
    if (useCache) {
      const cached = await cacheGet<User>(CACHE_KEYS.user(id))
      if (cached) {
        logger.debug('User fetched from cache', { userId: id })
        return cached
      }
    }

    // Query database
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

    if (result.length === 0) {
      return null
    }

    const user = result[0]

    // Cache result
    if (useCache) {
      await cacheSet(CACHE_KEYS.user(id), user, CACHE_TTL.MEDIUM)
    }

    logger.debug('User fetched from database', { userId: id })

    return user || null
  } catch (error) {
    logger.error('Failed to get user by ID', error as Error, { userId: id })
    throw new DatabaseError('Failed to fetch user', { cause: error as Error })
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0] || null
  } catch (error) {
    logger.error('Failed to get user by email', error as Error, { email })
    throw new DatabaseError('Failed to fetch user', { cause: error as Error })
  }
}

/**
 * Create user
 * Note: For user creation with password, use BetterAuth signup instead
 */
export async function createUser(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const { nanoid } = await import('nanoid')

    const newUser: NewUser = {
      id: nanoid(),
      ...data,
    }

    const [user] = await db.insert(users).values(newUser).returning()

    if (!user) {
      throw new DatabaseError('Failed to create user - no user returned')
    }

    logger.info('User created', { userId: user.id, email: user.email })

    // Note: Audit logging will be added when audit package is available
    // await logAudit('user.created', { userId: user.id, email: user.email })

    return user
  } catch (error) {
    logger.error('Failed to create user', error as Error)
    throw new DatabaseError('Failed to create user', { cause: error as Error })
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>): Promise<User> {
  try {
    const updates = {
      ...data,
      updatedAt: new Date(),
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()

    if (!updated) {
      throw new NotFoundError('User not found', { resource: 'user', resourceId: id })
    }

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(id))

    logger.info('User updated', { userId: id })

    // Note: Audit logging will be added when audit package is available
    // await logAudit('user.updated', { userId: id, changes: data })

    return updated
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    logger.error('Failed to update user', error as Error, { userId: id })
    throw new DatabaseError('Failed to update user', { cause: error as Error })
  }
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const [deleted] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    if (!deleted) {
      throw new NotFoundError('User not found', { resource: 'user', resourceId: id })
    }

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(id))

    logger.info('User deleted (soft delete)', { userId: id })

    // Note: Audit logging will be added when audit package is available
    // await logAudit('user.deleted', { userId: id })
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    logger.error('Failed to delete user', error as Error, { userId: id })
    throw new DatabaseError('Failed to delete user', { cause: error as Error })
  }
}

/**
 * Hard delete user (permanent)
 * Use with caution - this is irreversible
 */
export async function hardDeleteUser(id: string): Promise<void> {
  try {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()

    if (!deleted) {
      throw new NotFoundError('User not found', { resource: 'user', resourceId: id })
    }

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(id))

    logger.warn('User hard deleted (permanent)', { userId: id })

    // Note: Audit logging will be added when audit package is available
    // await logAudit('user.hard_deleted', { userId: id })
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    logger.error('Failed to hard delete user', error as Error, { userId: id })
    throw new DatabaseError('Failed to delete user', { cause: error as Error })
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId))

    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(userId))

    logger.debug('Last login updated', { userId })
  } catch (error) {
    // Don't throw - this is non-critical
    logger.error('Failed to update last login', error as Error, { userId })
  }
}

/**
 * Count total users
 */
export async function countUsers(filters: UserFilters = {}): Promise<number> {
  try {
    const conditions = []

    if (filters.role) {
      conditions.push(eq(users.role, filters.role))
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive))
    }

    let query = db.select().from(users)

    if (conditions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where(and(...conditions)) as any
    }

    const result = await query
    return result.length
  } catch (error) {
    logger.error('Failed to count users', error as Error)
    return 0
  }
}
