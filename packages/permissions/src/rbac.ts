/**
 * RBAC (Role-Based Access Control) implementation
 */

import { getUserPermissions } from './cache.js'
import { parsePermission } from '@sv-sdk/shared'
import { logAudit } from '@sv-sdk/audit'
import { logger, PermissionError } from '@sv-sdk/shared'

/**
 * Permission context for ABAC (Attribute-Based Access Control)
 * Future enhancement for context-aware permissions
 */
export interface PermissionContext {
  userId: string
  resourceId?: string
  resourceOwnerId?: string
  timestamp?: Date
  ipAddress?: string
  [key: string]: unknown
}

/**
 * Check if user has permission
 * Supports resource-level permissions (e.g., "edit:own:profile")
 */
export async function can(userId: string, permission: string, context?: PermissionContext): Promise<boolean> {
  try {
    // Get user permissions (from cache or database)
    const userPermissions = await getUserPermissions(userId)

    // Check for wildcard permission (super admin)
    if (userPermissions.includes('*:*:*')) {
      logger.debug('Permission granted (wildcard)', { userId, permission })
      return true
    }

    // Check for exact permission match
    if (userPermissions.includes(permission)) {
      logger.debug('Permission granted (exact match)', { userId, permission })
      return true
    }

    // Check for scope escalation
    // If user has "any" scope, they can access "own" scope
    const parsed = parsePermission(permission)

    if (parsed && parsed.scope === 'own') {
      const anyPermission = `${parsed.action}:any:${parsed.resource}`

      if (userPermissions.includes(anyPermission)) {
        logger.debug('Permission granted (scope escalation)', { userId, permission, granted: anyPermission })
        return true
      }
    }

    // Check resource ownership for "own" scope permissions
    if (parsed && parsed.scope === 'own' && context) {
      // User can access their own resources
      if (context.resourceOwnerId === userId) {
        const ownPermission = `${parsed.action}:own:${parsed.resource}`

        if (userPermissions.includes(ownPermission)) {
          logger.debug('Permission granted (resource ownership)', { userId, permission })
          return true
        }
      }
    }

    logger.debug('Permission denied', { userId, permission })
    return false
  } catch (error) {
    logger.error('Permission check failed', error as Error, { userId, permission })
    // Fail closed - deny permission on error
    return false
  }
}

/**
 * Check permission and throw error if denied
 */
export async function enforce(userId: string, permission: string, context?: PermissionContext): Promise<void> {
  const allowed = await can(userId, permission, context)

  if (!allowed) {
    // Log permission denial
    await logAudit('permission.denied', {
      userId,
      permission,
      resourceId: context?.resourceId,
      ipAddress: context?.ipAddress,
    })

    throw new PermissionError('Permission denied', {
      requiredPermission: permission,
      resource: context?.resourceId,
    })
  }

  // Log permission grant (optional, can be noisy)
  // await logAudit('permission.checked', { userId, permission, granted: true })
}

/**
 * Check if user has any of the permissions
 */
export async function canAny(userId: string, permissions: string[], context?: PermissionContext): Promise<boolean> {
  for (const permission of permissions) {
    const allowed = await can(userId, permission, context)
    if (allowed) {
      return true
    }
  }

  return false
}

/**
 * Check if user has all of the permissions
 */
export async function canAll(userId: string, permissions: string[], context?: PermissionContext): Promise<boolean> {
  for (const permission of permissions) {
    const allowed = await can(userId, permission, context)
    if (!allowed) {
      return false
    }
  }

  return true
}

/**
 * Get all permissions user has
 */
export async function getUserPermissionsList(userId: string): Promise<string[]> {
  return getUserPermissions(userId)
}

/**
 * Check if user has role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const { db, userRoles, roles } = await import('@sv-sdk/db-config')
    const { eq } = await import('@sv-sdk/db-config')

    const result = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    return result.some((row) => row.roles.name === roleName)
  } catch (error) {
    logger.error('Failed to check role', error as Error)
    return false
  }
}
