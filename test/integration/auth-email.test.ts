/**
 * Integration test: User signup with email verification
 * Tests auth package + email package integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { signup } from '@big0290/auth'
import { getEmailHistory } from '@big0290/email'

describe('Auth + Email Integration', () => {
  beforeAll(async () => {
    // Setup test environment
    // Note: This will be fully implemented once database setup is available
  })

  afterAll(async () => {
    // Cleanup test data
  })

  it('should create user and queue verification email', async () => {
    // Note: This is a placeholder test
    // Full implementation will be added once all packages are installed

    const result = await signup(
      {
        email: 'integration-test@example.com',
        password: 'IntegrationTest123!',
        confirmPassword: 'IntegrationTest123!',
        name: 'Integration Test User',
      },
      {
        ipAddress: '127.0.0.1',
      }
    )

    // Expect user created
    expect(result.success).toBe(true)

    // Note: Check email queue for verification email
    // This will be implemented when email package is fully integrated
  })
})
