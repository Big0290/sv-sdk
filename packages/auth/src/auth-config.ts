/**
 * BetterAuth configuration with Drizzle adapter
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@sv-sdk/db-config'
import { logger } from '@sv-sdk/shared'

// Type assertion needed for BetterAuth drizzle adapter
const dbAny = db as any

/**
 * BetterAuth instance
 * Configured with Drizzle adapter and custom settings
 */
export const auth = betterAuth({
  database: drizzleAdapter(dbAny, {
    provider: 'pg',
    schema: {
      // BetterAuth will use the tables from our auth schema
      // The tables are already defined in @sv-sdk/db-config
    },
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: false, // Require email verification
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Account settings
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },

  // Advanced options
  advanced: {
    generateId: () => {
      // Use nanoid for generating IDs
      const { nanoid } = require('nanoid')
      return nanoid()
    },
    cookieSameSite: 'lax',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  // Base URL
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',

  // Secret for signing tokens
  secret: process.env.BETTER_AUTH_SECRET!,

  // Trust proxy (for getting real IP behind reverse proxy)
  trustedOrigins: process.env.CORS_ORIGIN?.split(',') || [],
})

// Export types
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User

logger.info('BetterAuth configured with Drizzle adapter')
