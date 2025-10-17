/**
 * Security package
 * Export all security utilities
 */

// Rate limiting
export {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitHeaders,
  resetRateLimit,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limiter.js'

// CSRF protection
export {
  generateCSRFToken,
  verifyCSRFToken,
  enforceCSRF,
  getCSRFCookieName,
  getCSRFHeaderName,
  CSRF_COOKIE_OPTIONS,
  type CSRFTokenOptions,
} from './csrf.js'

// Sanitization
export {
  sanitizeHtml,
  sanitizeSQLLike,
  sanitizePath,
  sanitizeFilename,
  detectXSS,
  detectSQLInjection,
  stripHtmlTags,
  normalizeWhitespace,
  truncate,
  sanitizeUserInput,
  sanitizeEmail,
  sanitizeUrl,
} from './sanitization.js'

// Security headers
export {
  buildCSPHeader,
  getSecurityHeaders,
  getCORSHeaders,
  isOriginAllowed,
  DEFAULT_CSP,
  type CSPConfig,
} from './headers.js'

// Secrets management
export {
  validateRequiredEnvVars,
  redactSecret,
  redactSensitiveData,
  encrypt,
  decrypt,
  hashData,
  generateSecureToken,
  validateSecretLength,
  REQUIRED_ENV_VARS,
  SENSITIVE_ENV_KEYS,
} from './secrets.js'

// Security audit
export {
  logSecurityEvent,
  logFailedLogin,
  logRateLimitExceeded,
  logSuspiciousActivity,
  logPermissionDenied,
  logCSRFFailure,
  type SecurityEvent,
} from './security-audit.js'
