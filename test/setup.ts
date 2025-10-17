/**
 * Global test setup
 * Runs once before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'error' // Reduce noise in test output

// Global test timeout (can be overridden per test)
const DEFAULT_TIMEOUT = 10000

beforeAll(async () => {
  // Global setup before all tests
  console.log('🧪 Starting test suite...')
})

afterAll(async () => {
  // Global cleanup after all tests
  console.log('✅ Test suite completed')
})

beforeEach(async () => {
  // Setup before each test
  // This runs for every test
})

afterEach(async () => {
  // Cleanup after each test
  // This runs for every test
})

// Export utilities for test files
export { DEFAULT_TIMEOUT }
