/**
 * Audit schema - Audit logs (append-only)
 */

import { text, timestamp, boolean, json, pgSchema, index } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { users } from './auth.schema.js'

// Create audit schema
export const auditSchema = pgSchema('audit')

/**
 * Audit logs table
 * Append-only table for tracking all system events
 */
export const auditLogs = auditSchema.table(
  'audit_logs',
  {
    id: text('id').primaryKey(),

    // Event details
    eventType: text('event_type').notNull(), // e.g., 'user.login', 'email.sent'

    // User context (nullable for system events)
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

    // Request context
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Event metadata
    metadata: json('metadata').$type<Record<string, unknown>>().notNull().default({}),

    // PII handling
    piiMasked: boolean('pii_masked').default(false).notNull(),

    // Integrity
    hash: text('hash').notNull(), // Cryptographic hash for tamper detection

    // Timestamp
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for performance
    eventTypeIdx: index('audit_logs_event_type_idx').on(table.eventType),
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    eventTypeCreatedAtIdx: index('audit_logs_event_type_created_at_idx').on(table.eventType, table.createdAt),
    userIdCreatedAtIdx: index('audit_logs_user_id_created_at_idx').on(table.userId, table.createdAt),
  })
)

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const insertAuditLogSchema = createInsertSchema(auditLogs)
export const selectAuditLogSchema = createSelectSchema(auditLogs)

// Types
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
