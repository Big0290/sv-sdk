/**
 * Email provider exports and factory
 */

export * from './types.js'
export { BrevoProvider, createBrevoProvider } from './brevo.js'
export { SESProvider, createSESProvider } from './ses.js'
export { MockProvider, createMockProvider } from './mock.js'

import type { EmailProvider } from './types.js'
import { createBrevoProvider } from './brevo.js'
import { createSESProvider } from './ses.js'
import { createMockProvider } from './mock.js'
import { logger } from '@sv-sdk/shared'

/**
 * Get email provider based on environment configuration
 */
export function getEmailProvider(): EmailProvider {
  const providerType = process.env.EMAIL_PROVIDER || 'mock'

  logger.info('Initializing email provider', { type: providerType })

  switch (providerType) {
    case 'brevo':
      return createBrevoProvider()

    case 'ses':
      return createSESProvider()

    case 'mock':
      return createMockProvider()

    default:
      logger.warn(`Unknown email provider: ${providerType}, falling back to mock`)
      return createMockProvider()
  }
}

