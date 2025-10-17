/**
 * System event types
 * Used for event bus and audit logging
 */

/**
 * Authentication events
 */
export const AUTH_EVENTS = {
  USER_CREATED: 'auth.user.created',
  USER_UPDATED: 'auth.user.updated',
  USER_DELETED: 'auth.user.deleted',
  USER_LOGIN: 'auth.user.login',
  USER_LOGOUT: 'auth.user.logout',
  USER_LOGIN_FAILED: 'auth.user.login.failed',
  PASSWORD_CHANGED: 'auth.password.changed',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
  PASSWORD_RESET_COMPLETED: 'auth.password.reset.completed',
  EMAIL_VERIFIED: 'auth.email.verified',
  EMAIL_VERIFICATION_SENT: 'auth.email.verification.sent',
  SESSION_CREATED: 'auth.session.created',
  SESSION_EXPIRED: 'auth.session.expired',
  SESSION_REVOKED: 'auth.session.revoked',
  ACCOUNT_LOCKED: 'auth.account.locked',
  ACCOUNT_UNLOCKED: 'auth.account.unlocked',
} as const

/**
 * Permission events
 */
export const PERMISSION_EVENTS = {
  ROLE_CREATED: 'permission.role.created',
  ROLE_UPDATED: 'permission.role.updated',
  ROLE_DELETED: 'permission.role.deleted',
  ROLE_ASSIGNED: 'permission.role.assigned',
  ROLE_REVOKED: 'permission.role.revoked',
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_DENIED: 'permission.denied',
  PERMISSION_CHECKED: 'permission.checked',
} as const

/**
 * Email events
 */
export const EMAIL_EVENTS = {
  EMAIL_QUEUED: 'email.queued',
  EMAIL_SENT: 'email.sent',
  EMAIL_FAILED: 'email.failed',
  EMAIL_DELIVERED: 'email.delivered',
  EMAIL_BOUNCED: 'email.bounced',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
  EMAIL_UNSUBSCRIBED: 'email.unsubscribed',
  EMAIL_COMPLAINED: 'email.complained',
  TEMPLATE_CREATED: 'email.template.created',
  TEMPLATE_UPDATED: 'email.template.updated',
  TEMPLATE_DELETED: 'email.template.deleted',
} as const

/**
 * Audit events
 */
export const AUDIT_EVENTS = {
  AUDIT_LOG_CREATED: 'audit.log.created',
  AUDIT_LOG_EXPORTED: 'audit.log.exported',
  AUDIT_RETENTION_EXECUTED: 'audit.retention.executed',
} as const

/**
 * Security events
 */
export const SECURITY_EVENTS = {
  RATE_LIMIT_EXCEEDED: 'security.rate_limit.exceeded',
  CSRF_TOKEN_INVALID: 'security.csrf.invalid',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  IP_BLOCKED: 'security.ip.blocked',
  XSS_ATTEMPT: 'security.xss.attempt',
  SQL_INJECTION_ATTEMPT: 'security.sql_injection.attempt',
} as const

/**
 * System events
 */
export const SYSTEM_EVENTS = {
  STARTUP: 'system.startup',
  SHUTDOWN: 'system.shutdown',
  HEALTH_CHECK_FAILED: 'system.health_check.failed',
  DATABASE_CONNECTION_LOST: 'system.database.connection_lost',
  DATABASE_CONNECTION_RESTORED: 'system.database.connection_restored',
  REDIS_CONNECTION_LOST: 'system.redis.connection_lost',
  REDIS_CONNECTION_RESTORED: 'system.redis.connection_restored',
  EXTERNAL_SERVICE_ERROR: 'system.external_service.error',
} as const

/**
 * All event types combined
 */
export const EVENTS = {
  ...AUTH_EVENTS,
  ...PERMISSION_EVENTS,
  ...EMAIL_EVENTS,
  ...AUDIT_EVENTS,
  ...SECURITY_EVENTS,
  ...SYSTEM_EVENTS,
} as const

export type EventType = (typeof EVENTS)[keyof typeof EVENTS]
