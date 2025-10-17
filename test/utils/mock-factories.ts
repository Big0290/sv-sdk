/**
 * Mock data factories for testing
 * Generates realistic test data
 */

import { randomString, randomEmail, randomUUID } from './test-helpers.js'

/**
 * User factory
 */
export function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    email: randomEmail(),
    name: `Test User ${randomString(5)}`,
    emailVerified: false,
    isActive: true,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    ...overrides,
  }
}

/**
 * Create multiple mock users
 */
export function mockUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => mockUser(overrides))
}

/**
 * Session factory
 */
export function mockSession(overrides: Partial<Session> = {}): Session {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  return {
    id: randomUUID(),
    userId: randomUUID(),
    expiresAt,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    createdAt: now,
    ...overrides,
  }
}

/**
 * Role factory
 */
export function mockRole(overrides: Partial<Role> = {}): Role {
  return {
    id: randomUUID(),
    name: `test_role_${randomString(5)}`,
    description: 'Test role description',
    permissions: [],
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Email send record factory
 */
export function mockEmailSend(overrides: Partial<EmailSend> = {}): EmailSend {
  return {
    id: randomUUID(),
    templateName: 'verification_email',
    recipient: randomEmail(),
    subject: 'Test Email',
    status: 'queued',
    provider: 'mock',
    messageId: null,
    sentAt: null,
    deliveredAt: null,
    openedAt: null,
    clickedAt: null,
    failedAt: null,
    errorMessage: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Email template factory
 */
export function mockEmailTemplate(overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  return {
    id: randomUUID(),
    name: `test_template_${randomString(5)}`,
    subject: 'Test Subject: {{userName}}',
    mjml: '<mjml><mj-body><mj-text>Hello {{userName}}</mj-text></mj-body></mjml>',
    variables: ['userName'],
    locale: 'en',
    version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Audit log factory
 */
export function mockAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: randomUUID(),
    eventType: 'user.login',
    userId: randomUUID(),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    metadata: {},
    piiMasked: false,
    hash: randomString(64),
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create multiple mock audit logs
 */
export function mockAuditLogs(count: number, overrides: Partial<AuditLog> = {}): AuditLog[] {
  return Array.from({ length: count }, () => mockAuditLog(overrides))
}

/**
 * Permission cache entry factory
 */
export function mockPermissionCache(overrides: Partial<PermissionCache> = {}): PermissionCache {
  return {
    id: randomUUID(),
    userId: randomUUID(),
    permissions: ['read:own:profile', 'update:own:profile'],
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    createdAt: new Date(),
    ...overrides,
  }
}

// Type definitions (these will be properly typed once db-config package exists)
interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  isActive: boolean
  role: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

interface Session {
  id: string
  userId: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

interface EmailSend {
  id: string
  templateName: string
  recipient: string
  subject: string
  status: string
  provider: string
  messageId: string | null
  sentAt: Date | null
  deliveredAt: Date | null
  openedAt: Date | null
  clickedAt: Date | null
  failedAt: Date | null
  errorMessage: string | null
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  mjml: string
  variables: string[]
  locale: string
  version: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuditLog {
  id: string
  eventType: string
  userId: string | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  piiMasked: boolean
  hash: string
  createdAt: Date
}

interface PermissionCache {
  id: string
  userId: string
  permissions: string[]
  expiresAt: Date
  createdAt: Date
}
