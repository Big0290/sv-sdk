/**
 * Security audit logging
 * Tracks security-related events for monitoring and compliance
 */

import { SECURITY_EVENTS, logger } from '@big0290/shared'

/**
 * Security event data
 */
export interface SecurityEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  details?: Record<string, unknown>
}

/**
 * Log security event
 * Note: This will be integrated with @big0290/audit package
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  // Log to application logger immediately
  const logLevel = event.severity === 'critical' || event.severity === 'high' ? 'error' : 'warn'

  if (logLevel === 'error') {
    logger.error(`Security event: ${event.type}`, undefined, {
      severity: event.severity,
      userId: event.userId || 'unknown',
      ipAddress: event.ipAddress || 'unknown',
      resource: event.resource || 'unknown',
      ...event.details,
    })
  } else {
    logger.warn(`Security event: ${event.type}`, {
      severity: event.severity,
      userId: event.userId || 'unknown',
      ipAddress: event.ipAddress || 'unknown',
      resource: event.resource || 'unknown',
      ...event.details,
    })
  }

  // TODO: Integration with @big0290/audit package when available
  // await logAudit(event.type, {
  //   severity: event.severity,
  //   userId: event.userId,
  //   ipAddress: event.ipAddress,
  //   userAgent: event.userAgent,
  //   resource: event.resource,
  //   ...event.details,
  // })
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(data: { email: string; ipAddress: string; userAgent?: string }): Promise<void> {
  await logSecurityEvent({
    type: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
    severity: 'medium',
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    details: {
      email: data.email,
      attemptType: 'login',
    },
  })
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(data: {
  identifier: string
  resource: string
  ipAddress?: string
}): Promise<void> {
  await logSecurityEvent({
    type: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
    severity: 'medium',
    ipAddress: data.ipAddress,
    resource: data.resource,
    details: {
      identifier: data.identifier,
    },
  })
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(data: {
  type: 'xss_attempt' | 'sql_injection' | 'path_traversal' | 'brute_force' | 'other'
  userId?: string
  ipAddress: string
  userAgent?: string
  details?: Record<string, unknown>
}): Promise<void> {
  const eventType = {
    xss_attempt: SECURITY_EVENTS.XSS_ATTEMPT,
    sql_injection: SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
    path_traversal: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    brute_force: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    other: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
  }[data.type]

  await logSecurityEvent({
    type: eventType,
    severity: 'high',
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    details: {
      activityType: data.type,
      ...data.details,
    },
  })
}

/**
 * Log permission denial
 */
export async function logPermissionDenied(data: {
  userId: string
  permission: string
  resource?: string
  ipAddress?: string
}): Promise<void> {
  await logSecurityEvent({
    type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    severity: 'low',
    userId: data.userId,
    ipAddress: data.ipAddress,
    resource: data.resource,
    details: {
      permission: data.permission,
      reason: 'permission_denied',
    },
  })
}

/**
 * Log CSRF token validation failure
 */
export async function logCSRFFailure(data: { userId?: string; ipAddress: string; userAgent?: string }): Promise<void> {
  await logSecurityEvent({
    type: SECURITY_EVENTS.CSRF_TOKEN_INVALID,
    severity: 'high',
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    details: {
      reason: 'csrf_validation_failed',
    },
  })
}
