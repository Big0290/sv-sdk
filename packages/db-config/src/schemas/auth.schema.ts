/**
 * Auth schema - Users, Sessions, Accounts, Verifications
 * BetterAuth required tables with custom extensions
 */

import { text, timestamp, boolean, pgSchema } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'

// Create auth schema
export const authSchema = pgSchema('auth')

/**
 * Users table
 * BetterAuth required fields + custom extensions
 */
export const users = authSchema.table('users', {
  id: text('id').primaryKey(), // BetterAuth uses text IDs
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: text('name'),
  image: text('image'),

  // Custom fields
  role: text('role').default('user').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Sessions table
 * BetterAuth required fields + custom extensions
 */
export const sessions = authSchema.table('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),

  // Custom fields for tracking
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Accounts table
 * For OAuth providers and linked accounts
 */
export const accounts = authSchema.table('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'email', 'google', 'github', etc.
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Verifications table
 * For email verification tokens, password reset tokens, etc.
 */
export const verifications = authSchema.table('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // Email or phone
  value: text('value').notNull(), // Token
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertSessionSchema = createInsertSchema(sessions)
export const selectSessionSchema = createSelectSchema(sessions)

export const insertAccountSchema = createInsertSchema(accounts)
export const selectAccountSchema = createSelectSchema(accounts)

export const insertVerificationSchema = createInsertSchema(verifications)
export const selectVerificationSchema = createSelectSchema(verifications)

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
