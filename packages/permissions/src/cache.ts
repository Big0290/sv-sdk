/**
 * Permission caching with Redis
 */

import { db, userRoles, roles, permissionCache, type PermissionCache } from '@sv-sdk/db-config'
import { eq } from 'drizzle-orm'
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS, CACHE_TTL } from '@sv-sdk/cache'
import { logger } from '@sv-sdk/shared'
import { nanoid } from 'nanoid'

/**
 * Get user permissions (with caching)
 */
export async function getUserPermissions(userId: string, useCache: boolean = true): Promise<string[]> {
  try {
    // Check cache first
    if (useCache) {
      const cached = await cacheGet<string[]>(CACHE_KEYS.permissions(userId))

      if (cached) {
        logger.debug('Permissions fetched from cache', { userId })
        return cached
      }
    }

    // Query database - get all roles for user
    const userRoleRecords = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    // Flatten permissions from all roles
    const allPermissions = new Set<string>()

    for (const record of userRoleRecords) {
      const rolePermissions = record.roles.permissions as string[]

      for (const perm of rolePermissions) {
        allPermissions.add(perm)
      }
    }

    const permissions = Array.from(allPermissions)

    // Cache permissions
    if (useCache) {
      await cacheSet(CACHE_KEYS.permissions(userId), permissions, CACHE_TTL.MEDIUM)

      // Also update permission_cache table for persistence
      await upsertPermissionCache(userId, permissions)
    }

    logger.debug('Permissions fetched from database', { userId, count: permissions.length })

    return permissions
  } catch (error) {
    logger.error('Failed to get user permissions', error as Error, { userId })

    // Fallback to empty permissions on error
    return []
  }
}

/**
 * Invalidate permission cache for user
 */
export async function invalidatePermissionCache(userId: string): Promise<void> {
  try {
    // Delete from Redis
    await cacheDelete(CACHE_KEYS.permissions(userId))

    // Delete from database cache table
    await db.delete(permissionCache).where(eq(permissionCache.userId, userId))

    logger.info('Permission cache invalidated', { userId })
  } catch (error) {
    logger.error('Failed to invalidate permission cache', error as Error, { userId })
  }
}

/**
 * Invalidate permission cache for all users with a specific role
 */
export async function invalidateRolePermissionCache(roleId: string): Promise<void> {
  try {
    // Get all users with this role
    const usersWithRole = await db.select().from(userRoles).where(eq(userRoles.roleId, roleId))

    // Invalidate cache for each user
    for (const userRole of usersWithRole) {
      await invalidatePermissionCache(userRole.userId)
    }

    logger.info('Permission cache invalidated for role', { roleId, userCount: usersWithRole.length })
  } catch (error) {
    logger.error('Failed to invalidate role permission cache', error as Error, { roleId })
  }
}

/**
 * Refresh permission cache for user
 * Forces re-computation of permissions
 */
export async function refreshPermissionCache(userId: string): Promise<string[]> {
  await invalidatePermissionCache(userId)
  return getUserPermissions(userId, true)
}

/**
 * Upsert permission cache in database
 * Provides persistence layer for Redis cache
 */
async function upsertPermissionCache(userId: string, permissions: string[]): Promise<void> {
  try {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // 5 minutes TTL

    // Check if exists
    const existing = await db.select().from(permissionCache).where(eq(permissionCache.userId, userId)).limit(1)

    if (existing.length > 0) {
      // Update existing
      await db
        .update(permissionCache)
        .set({
          permissions: permissions as any,
          expiresAt,
        })
        .where(eq(permissionCache.userId, userId))
    } else {
      // Insert new
      await db.insert(permissionCache).values({
        id: nanoid(),
        userId,
        permissions: permissions as any,
        expiresAt,
      })
    }
  } catch (error) {
    // Non-critical - don't throw
    logger.error('Failed to upsert permission cache', error as Error)
  }
}

/**
 * Clean expired permission cache entries
 * Should be run periodically
 */
export async function cleanExpiredPermissionCache(): Promise<number> {
  try {
    const { lt } = await import('drizzle-orm')
    const now = new Date()

    const deleted = await db.delete(permissionCache).where(lt(permissionCache.expiresAt, now)).returning()

    logger.info('Expired permission cache cleaned', { count: deleted.length })

    return deleted.length
  } catch (error) {
    logger.error('Failed to clean expired permission cache', error as Error)
    return 0
  }
}

