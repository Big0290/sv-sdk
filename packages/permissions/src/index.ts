/**
 * Permissions package
 * Export RBAC, role service, caching, and middleware
 */

// RBAC
export {
  can,
  enforce,
  canAny,
  canAll,
  getUserPermissionsList,
  hasRole,
  type PermissionContext,
} from './rbac.js'

// Permission cache
export {
  getUserPermissions,
  invalidatePermissionCache,
  invalidateRolePermissionCache,
  refreshPermissionCache,
  cleanExpiredPermissionCache,
} from './cache.js'

// Role service
export {
  getRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  revokeRole,
  getUserRoles,
  getUsersWithRole,
  bulkAssignRole,
} from './role-service.js'

// Permission constants
export {
  PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_GROUPS,
  WILDCARD_PERMISSION,
  isWildcardPermission,
} from './permissions.js'

// Middleware
export { createPermissionCheck, checkRoutePermission, requirePermission } from './middleware.js'

