/**
 * Role management service
 */

import { db, roles, userRoles, type Role, type NewRole, eq, and } from '@sv-sdk/db-config'
import { invalidatePermissionCache, invalidateRolePermissionCache } from './cache.js'
import { logAudit } from '@sv-sdk/audit'
import { logger, NotFoundError, ConstraintError, RoleError } from '@sv-sdk/shared'
import { nanoid } from 'nanoid'

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  try {
    const allRoles = await db.select().from(roles)
    return allRoles
  } catch (error) {
    logger.error('Failed to get roles', error as Error)
    throw error
  }
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role | null> {
  try {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0] || null
  } catch (error) {
    logger.error('Failed to get role by ID', error as Error, { id })
    return null
  }
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string): Promise<Role | null> {
  try {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0] || null
  } catch (error) {
    logger.error('Failed to get role by name', error as Error, { name })
    return null
  }
}

/**
 * Create role
 */
export async function createRole(data: Omit<NewRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
  try {
    const newRole: NewRole = {
      id: nanoid(),
      ...data,
    }

    const [role] = await db.insert(roles).values(newRole).returning()

    if (!role) {
      throw new Error('Failed to create role')
    }

    logger.info('Role created', { roleId: role.id, name: role.name })

    await logAudit('role.created', { roleId: role.id, name: role.name, permissions: role.permissions })

    return role
  } catch (error) {
    logger.error('Failed to create role', error as Error)
    throw error
  }
}

/**
 * Update role
 */
export async function updateRole(id: string, data: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<Role> {
  try {
    // Check if role is system role
    const existing = await getRoleById(id)

    if (!existing) {
      throw new NotFoundError('Role not found', { resource: 'role', resourceId: id })
    }

    if (existing.isSystem) {
      throw new RoleError('Cannot modify system role')
    }

    const updates = {
      ...data,
      updatedAt: new Date(),
    }

    const [updated] = await db.update(roles).set(updates).where(eq(roles.id, id)).returning()

    if (!updated) {
      throw new NotFoundError('Role not found', { resource: 'role', resourceId: id })
    }

    // Invalidate permission cache for all users with this role
    await invalidateRolePermissionCache(id)

    logger.info('Role updated', { roleId: id })

    await logAudit('role.updated', { roleId: id, changes: data })

    return updated
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof RoleError) {
      throw error
    }
    logger.error('Failed to update role', error as Error, { roleId: id })
    throw error
  }
}

/**
 * Delete role
 */
export async function deleteRole(id: string, reassignToRoleId?: string): Promise<void> {
  try {
    // Check if role is system role
    const existing = await getRoleById(id)

    if (!existing) {
      throw new NotFoundError('Role not found', { resource: 'role', resourceId: id })
    }

    if (existing.isSystem) {
      throw new RoleError('Cannot delete system role')
    }

    // Get users with this role
    const usersWithRole = await db.select().from(userRoles).where(eq(userRoles.roleId, id))

    // If there are users with this role, reassign or fail
    if (usersWithRole.length > 0) {
      if (reassignToRoleId) {
        // Reassign users to new role
        for (const userRole of usersWithRole) {
          await assignRole(userRole.userId, reassignToRoleId)
        }

        logger.info('Users reassigned to new role', {
          fromRoleId: id,
          toRoleId: reassignToRoleId,
          count: usersWithRole.length,
        })
      } else {
        throw new ConstraintError('Cannot delete role with assigned users. Provide reassignToRoleId to reassign users.')
      }
    }

    // Delete role
    await db.delete(roles).where(eq(roles.id, id))

    logger.info('Role deleted', { roleId: id })

    await logAudit('role.deleted', { roleId: id, name: existing.name })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof RoleError || error instanceof ConstraintError) {
      throw error
    }
    logger.error('Failed to delete role', error as Error, { roleId: id })
    throw error
  }
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleId: string, grantedBy?: string): Promise<void> {
  try {
    // Check if role exists
    const role = await getRoleById(roleId)

    if (!role) {
      throw new NotFoundError('Role not found', { resource: 'role', resourceId: roleId })
    }

    // Check if already assigned
    const existing = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1)

    if (existing.length > 0) {
      logger.debug('Role already assigned', { userId, roleId })
      return
    }

    // Assign role
    await db.insert(userRoles).values({
      userId,
      roleId,
      grantedBy: grantedBy || null,
    })

    // Invalidate permission cache
    await invalidatePermissionCache(userId)

    logger.info('Role assigned', { userId, roleId, roleName: role.name })

    await logAudit('role.assigned', {
      userId,
      roleId,
      roleName: role.name,
      grantedBy,
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    logger.error('Failed to assign role', error as Error, { userId, roleId })
    throw error
  }
}

/**
 * Revoke role from user
 */
export async function revokeRole(userId: string, roleId: string): Promise<void> {
  try {
    const deleted = await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .returning()

    if (deleted.length === 0) {
      logger.debug('Role not assigned to user', { userId, roleId })
      return
    }

    // Invalidate permission cache
    await invalidatePermissionCache(userId)

    logger.info('Role revoked', { userId, roleId })

    await logAudit('role.revoked', { userId, roleId })
  } catch (error) {
    logger.error('Failed to revoke role', error as Error, { userId, roleId })
    throw error
  }
}

/**
 * Get roles for user
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const userRoleRecords = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    return userRoleRecords.map((record) => record.roles)
  } catch (error) {
    logger.error('Failed to get user roles', error as Error, { userId })
    return []
  }
}

/**
 * Get users with role
 */
export async function getUsersWithRole(roleId: string): Promise<string[]> {
  try {
    const usersWithRole = await db.select().from(userRoles).where(eq(userRoles.roleId, roleId))

    return usersWithRole.map((ur) => ur.userId)
  } catch (error) {
    logger.error('Failed to get users with role', error as Error, { roleId })
    return []
  }
}

/**
 * Bulk assign role to multiple users
 */
export async function bulkAssignRole(userIds: string[], roleId: string, grantedBy?: string): Promise<number> {
  try {
    let assignedCount = 0

    for (const userId of userIds) {
      try {
        await assignRole(userId, roleId, grantedBy)
        assignedCount++
      } catch (error) {
        logger.error('Failed to assign role in bulk operation', error as Error, { userId, roleId })
        // Continue with next user
      }
    }

    logger.info('Bulk role assignment completed', { roleId, requested: userIds.length, assigned: assignedCount })

    return assignedCount
  } catch (error) {
    logger.error('Bulk role assignment failed', error as Error)
    throw error
  }
}
