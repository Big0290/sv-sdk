/**
 * Permission middleware for SvelteKit
 */

import { can, enforce, type PermissionContext } from './rbac.js'
import { logger } from '@sv-sdk/shared'

/**
 * Create permission check middleware
 * Returns function compatible with SvelteKit hooks
 */
export function createPermissionCheck(requiredPermission: string) {
  return async (userId: string | undefined, context?: PermissionContext) => {
    if (!userId) {
      return {
        allowed: false,
        error: 'User not authenticated',
      }
    }

    const allowed = await can(userId, requiredPermission, context)

    return {
      allowed,
      error: allowed ? null : 'Insufficient permissions',
    }
  }
}

/**
 * Check if user can access route
 * For use in SvelteKit hooks
 */
export async function checkRoutePermission(
  userId: string | undefined,
  pathname: string
): Promise<{
  allowed: boolean
  redirectTo?: string
}> {
  if (!userId) {
    return {
      allowed: false,
      redirectTo: `/login?redirect=${encodeURIComponent(pathname)}`,
    }
  }

  // Define route permissions
  const routePermissions: Record<string, string> = {
    '/admin/users': 'read:any:user',
    '/admin/roles': 'read:any:role',
    '/admin/audit': 'read:any:audit_log',
    '/admin/templates': 'read:any:template',
    '/admin/settings': 'update:any:system',
  }

  // Check if route requires permission
  const requiredPermission = routePermissions[pathname]

  if (!requiredPermission) {
    // No specific permission required
    return { allowed: true }
  }

  // Check permission
  const allowed = await can(userId, requiredPermission)

  if (!allowed) {
    logger.warn('Route access denied', { userId, pathname, requiredPermission })

    return {
      allowed: false,
      redirectTo: '/forbidden',
    }
  }

  return { allowed: true }
}

/**
 * Protect route with permission requirement
 * Decorator-style function for route handlers
 */
export function requirePermission(permission: string) {
  return <T>(handler: (userId: string, ...args: unknown[]) => Promise<T>) => {
    return async (userId: string | undefined, ...args: unknown[]): Promise<T> => {
      if (!userId) {
        throw new Error('User not authenticated')
      }

      await enforce(userId, permission)

      return handler(userId, ...args)
    }
  }
}
