/**
 * Permission constants (placeholder)
 * Actual permissions will be defined in @sv-sdk/permissions package
 */

/**
 * Permission actions
 */
export const PERMISSION_ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  EXECUTE: 'execute',
} as const

/**
 * Permission resources
 */
export const PERMISSION_RESOURCE = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  EMAIL: 'email',
  TEMPLATE: 'template',
  AUDIT_LOG: 'audit_log',
  SYSTEM: 'system',
} as const

/**
 * Permission scope
 */
export const PERMISSION_SCOPE = {
  OWN: 'own', // User can only access their own resources
  ANY: 'any', // User can access any resource
  TEAM: 'team', // User can access team resources (future)
} as const

/**
 * Build permission string
 * Format: action:scope:resource
 * Example: "edit:own:profile" or "delete:any:user"
 */
export function buildPermission(action: string, scope: string, resource: string): string {
  return `${action}:${scope}:${resource}`
}

/**
 * Parse permission string
 */
export function parsePermission(permission: string): {
  action: string
  scope: string
  resource: string
} | null {
  const parts = permission.split(':')
  if (parts.length !== 3) {
    return null
  }
  const [action, scope, resource] = parts
  return { action, scope, resource }
}
