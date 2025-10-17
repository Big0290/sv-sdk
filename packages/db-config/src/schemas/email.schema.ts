/**
 * Email schema - Templates, Sends, Webhooks, Preferences
 */

import { pgTable, text, timestamp, boolean, integer, json, pgSchema } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { users } from './auth.schema.js'

// Create email schema
export const emailSchema = pgSchema('email')

/**
 * Email templates table
 * MJML templates with versioning
 */
export const emailTemplates = emailSchema.table('email_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  subject: text('subject').notNull(),
  mjml: text('mjml').notNull(), // MJML template source
  variables: json('variables').$type<string[]>().notNull().default([]),
  locale: text('locale').default('en').notNull(),
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Email sends table
 * Tracks all email sending attempts
 */
export const emailSends = emailSchema.table('email_sends', {
  id: text('id').primaryKey(),
  templateName: text('template_name').notNull(),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),

  // Status tracking
  status: text('status').notNull(), // 'queued', 'sent', 'delivered', 'bounced', 'failed'
  provider: text('provider').notNull(), // 'brevo', 'ses', 'mock'
  messageId: text('message_id'), // Provider's message ID

  // Event timestamps
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  failedAt: timestamp('failed_at'),

  // Error tracking
  errorMessage: text('error_message'),

  // Metadata
  metadata: json('metadata').$type<Record<string, unknown>>().notNull().default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Email webhooks table
 * Tracks webhook events from email providers
 */
export const emailWebhooks = emailSchema.table('email_webhooks', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  eventType: text('event_type').notNull(), // 'delivered', 'bounced', 'opened', etc.
  messageId: text('message_id'),
  recipient: text('recipient'),
  payload: json('payload').$type<Record<string, unknown>>().notNull(),
  processed: boolean('processed').default(false).notNull(),
  processedAt: timestamp('processed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Email preferences table
 * User email subscription preferences
 */
export const emailPreferences = emailSchema.table('email_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Subscription preferences
  marketing: boolean('marketing').default(true).notNull(),
  transactional: boolean('transactional').default(true).notNull(),
  notifications: boolean('notifications').default(true).notNull(),

  // Unsubscribe tracking
  unsubscribedAt: timestamp('unsubscribed_at'),
  unsubscribeToken: text('unsubscribe_token').unique(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const emailPreferencesRelations = relations(emailPreferences, ({ one }) => ({
  user: one(users, {
    fields: [emailPreferences.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates)
export const selectEmailTemplateSchema = createSelectSchema(emailTemplates)

export const insertEmailSendSchema = createInsertSchema(emailSends)
export const selectEmailSendSchema = createSelectSchema(emailSends)

export const insertEmailWebhookSchema = createInsertSchema(emailWebhooks)
export const selectEmailWebhookSchema = createSelectSchema(emailWebhooks)

export const insertEmailPreferencesSchema = createInsertSchema(emailPreferences)
export const selectEmailPreferencesSchema = createSelectSchema(emailPreferences)

// Types
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert

export type EmailSend = typeof emailSends.$inferSelect
export type NewEmailSend = typeof emailSends.$inferInsert

export type EmailWebhook = typeof emailWebhooks.$inferSelect
export type NewEmailWebhook = typeof emailWebhooks.$inferInsert

export type EmailPreferences = typeof emailPreferences.$inferSelect
export type NewEmailPreferences = typeof emailPreferences.$inferInsert
