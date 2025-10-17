/**
 * Permissions DTOs - Validation schemas for permission operations
 */

import { z } from 'zod'
import { insertRoleSchema } from '@sv-sdk/db-config'

/**
 * Permission string schema
 * Format: action:scope:resource (e.g., "read:any:user")
 */
export const permissionStringSchema = z
  .string()
  .regex(/^[a-z_]+:(any|own|team):[a-z_]+$/, 'Permission must be in format: action:scope:resource')

/**
 * Create role request schema
 */
export const createRoleRequestSchema = insertRoleSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isSystem: true, // Cannot be set by users
  })
  .extend({
    name: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9_]+$/, 'Role name must be lowercase alphanumeric with underscores'),
    description: z.string().max(500).optional(),
    permissions: z.array(permissionStringSchema).default([]),
  })

export type CreateRoleRequest = z.infer<typeof createRoleRequestSchema>

/**
 * Update role request schema
 */
export const updateRoleRequestSchema = createRoleRequestSchema.partial().omit({
  name: true, // Name cannot be changed
})

export type UpdateRoleRequest = z.infer<typeof updateRoleRequestSchema>

/**
 * Assign role request schema
 */
export const assignRoleRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleId: z.string().min(1, 'Role ID is required'),
})

export type AssignRoleRequest = z.infer<typeof assignRoleRequestSchema>

/**
 * Revoke role request schema
 */
export const revokeRoleRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleId: z.string().min(1, 'Role ID is required'),
})

export type RevokeRoleRequest = z.infer<typeof revokeRoleRequestSchema>

/**
 * Check permission request schema
 */
export const checkPermissionRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permission: permissionStringSchema,
  resourceId: z.string().optional(), // For resource-level checks
})

export type CheckPermissionRequest = z.infer<typeof checkPermissionRequestSchema>

/**
 * Bulk assign roles request schema
 */
export const bulkAssignRolesRequestSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100, 'Maximum 100 users per batch'),
  roleId: z.string().min(1, 'Role ID is required'),
})

export type BulkAssignRolesRequest = z.infer<typeof bulkAssignRolesRequestSchema>

/**
 * Permission query schema
 */
export const permissionQuerySchema = z.object({
  userId: z.string().optional(),
  roleId: z.string().optional(),
  includeInherited: z.boolean().default(true),
})

export type PermissionQuery = z.infer<typeof permissionQuerySchema>
