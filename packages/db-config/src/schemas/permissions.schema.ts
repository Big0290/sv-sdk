/**
 * Permissions schema - Roles, User Roles, Permission Cache
 */

import { pgTable, text, timestamp, boolean, json, pgSchema, primaryKey, index, unique } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { users } from './auth.schema.js'

// Create permissions schema
export const permissionsSchema = pgSchema('permissions')

/**
 * Roles table
 * Defines roles in the RBAC system
 */
export const roles = permissionsSchema.table('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),

  // Permissions as JSON array of permission strings
  // e.g., ['read:any:user', 'update:own:profile']
  permissions: json('permissions').$type<string[]>().notNull().default([]),

  // System roles cannot be deleted or modified
  isSystem: boolean('is_system').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * User roles junction table
 * Links users to roles (many-to-many)
 */
export const userRoles = permissionsSchema.table(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    // Audit fields
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
    grantedBy: text('granted_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
    userIdIdx: index('user_roles_user_id_idx').on(table.userId),
    roleIdIdx: index('user_roles_role_id_idx').on(table.roleId),
  })
)

/**
 * Permission cache table
 * Caches computed permissions for users to improve performance
 */
export const permissionCache = permissionsSchema.table(
  'permission_cache',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Flattened permissions from all roles
    permissions: json('permissions').$type<string[]>().notNull().default([]),

    // Cache expiry
    expiresAt: timestamp('expires_at').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('permission_cache_user_id_idx').on(table.userId),
    expiresAtIdx: index('permission_cache_expires_at_idx').on(table.expiresAt),
  })
)

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  grantedByUser: one(users, {
    fields: [userRoles.grantedBy],
    references: [users.id],
  }),
}))

export const permissionCacheRelations = relations(permissionCache, ({ one }) => ({
  user: one(users, {
    fields: [permissionCache.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const insertRoleSchema = createInsertSchema(roles)
export const selectRoleSchema = createSelectSchema(roles)

export const insertUserRoleSchema = createInsertSchema(userRoles)
export const selectUserRoleSchema = createSelectSchema(userRoles)

export const insertPermissionCacheSchema = createInsertSchema(permissionCache)
export const selectPermissionCacheSchema = createSelectSchema(permissionCache)

// Types
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert

export type PermissionCache = typeof permissionCache.$inferSelect
export type NewPermissionCache = typeof permissionCache.$inferInsert
