/**
 * Cache configuration and constants
 */

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIX = {
  USER: 'user',
  SESSION: 'session',
  PERMISSIONS: 'permissions',
  RATE_LIMIT: 'rate_limit',
  EMAIL: 'email',
  TEMPLATE: 'template',
  AUDIT: 'audit',
} as const

/**
 * Cache key factory functions
 * Provides consistent key naming across the application
 */
export const CACHE_KEYS = {
  /**
   * User cache key
   */
  user: (id: string) => `${CACHE_PREFIX.USER}:${id}`,

  /**
   * User profile cache key
   */
  userProfile: (id: string) => `${CACHE_PREFIX.USER}:profile:${id}`,

  /**
   * Session cache key
   */
  session: (sessionId: string) => `${CACHE_PREFIX.SESSION}:${sessionId}`,

  /**
   * User permissions cache key
   */
  permissions: (userId: string) => `${CACHE_PREFIX.PERMISSIONS}:${userId}`,

  /**
   * Rate limit key
   */
  rateLimit: (identifier: string, endpoint: string) => `${CACHE_PREFIX.RATE_LIMIT}:${identifier}:${endpoint}`,

  /**
   * Email template cache key
   */
  emailTemplate: (name: string, locale: string = 'en') => `${CACHE_PREFIX.TEMPLATE}:${name}:${locale}`,

  /**
   * Email send status key
   */
  emailStatus: (messageId: string) => `${CACHE_PREFIX.EMAIL}:status:${messageId}`,

  /**
   * Generic key builder
   */
  build: (...parts: string[]) => parts.join(':'),
} as const

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  EMAIL: 'emails',
  AUDIT: 'audit',
  NOTIFICATIONS: 'notifications',
} as const

/**
 * Queue priorities
 */
export const QUEUE_PRIORITY = {
  CRITICAL: 1,
  HIGH: 3,
  NORMAL: 5,
  LOW: 7,
  BACKGROUND: 9,
} as const
