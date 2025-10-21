/**
 * Security headers configuration
 * Provides secure HTTP headers for production
 */

/**
 * Content Security Policy (CSP) configuration
 */
export interface CSPConfig {
  directives?: {
    'default-src'?: string[]
    'script-src'?: string[]
    'style-src'?: string[]
    'img-src'?: string[]
    'font-src'?: string[]
    'connect-src'?: string[]
    'frame-ancestors'?: string[]
    'form-action'?: string[]
    'base-uri'?: string[]
    'object-src'?: string[]
  }
  reportUri?: string
  reportOnly?: boolean
}

/**
 * Build CSP header value
 */
export function buildCSPHeader(config: CSPConfig): string {
  const directives: string[] = []

  if (config.directives) {
    for (const [key, values] of Object.entries(config.directives)) {
      if (values && values.length > 0) {
        directives.push(`${key} ${values.join(' ')}`)
      }
    }
  }

  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`)
  }

  return directives.join('; ')
}

/**
 * Default CSP configuration
 */
export const DEFAULT_CSP: CSPConfig = {
  directives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Adjust for your needs
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
  },
}

/**
 * Get all security headers
 */
export function getSecurityHeaders(
  options: {
    csp?: CSPConfig
    hsts?: boolean
    noSniff?: boolean
    xssProtection?: boolean
    frameOptions?: 'DENY' | 'SAMEORIGIN'
  } = {}
): Record<string, string> {
  const { csp = DEFAULT_CSP, hsts = true, noSniff = true, xssProtection = true, frameOptions = 'DENY' } = options

  const headers: Record<string, string> = {}

  // Content Security Policy
  if (csp) {
    const headerName = csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
    headers[headerName] = buildCSPHeader(csp)
  }

  // HTTP Strict Transport Security
  if (hsts && process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  // X-Content-Type-Options
  if (noSniff) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  // X-XSS-Protection (legacy, but still useful)
  if (xssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block'
  }

  // X-Frame-Options
  headers['X-Frame-Options'] = frameOptions

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

  // Permissions Policy (formerly Feature-Policy)
  headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

  return headers
}

/**
 * Get CORS headers
 */
export function getCORSHeaders(
  options: {
    origin?: string | string[]
    credentials?: boolean
    methods?: string[]
    headers?: string[]
    maxAge?: number
  } = {}
): Record<string, string> {
  const {
    origin = process.env.CORS_ORIGIN || '*',
    credentials = true,
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
    maxAge = 86400, // 24 hours
  } = options

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': headers.join(', '),
    'Access-Control-Max-Age': String(maxAge),
  }

  // Handle origin
  if (Array.isArray(origin)) {
    // Multiple origins - must be handled dynamically per request
    corsHeaders['Access-Control-Allow-Origin'] = origin[0] || '*'
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  }

  // Allow credentials
  if (credentials) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
  }

  return corsHeaders
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string, allowedOrigins: string | string[]): boolean {
  if (allowedOrigins === '*') {
    return true
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin)
  }

  return allowedOrigins === origin
}
