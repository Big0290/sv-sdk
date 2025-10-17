/**
 * Test helper utilities
 */

import { vi } from 'vitest'

/**
 * Wait for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wait until condition is true
 */
export async function waitUntil(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number
    interval?: number
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await wait(interval)
  }

  throw new Error(`waitUntil timeout after ${timeout}ms`)
}

/**
 * Create a mock function with type safety
 */
export function mockFn<T extends (...args: any[]) => any>(): T {
  return vi.fn() as T
}

/**
 * Suppress console output during test
 */
export function suppressConsole() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  }

  beforeEach(() => {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.info = vi.fn()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.info = originalConsole.info
  })
}

/**
 * Create a test error with specific properties
 */
export function createTestError(
  message: string,
  options: {
    code?: string
    statusCode?: number
  } = {}
): Error {
  const error = new Error(message) as Error & {
    code?: string
    statusCode?: number
  }
  if (options.code) error.code = options.code
  if (options.statusCode) error.statusCode = options.statusCode
  return error
}

/**
 * Assert that function throws specific error
 */
export async function assertThrows<E extends Error = Error>(
  fn: () => Promise<void> | void,
  errorClass?: new (...args: any[]) => E,
  message?: string | RegExp
): Promise<E> {
  try {
    await fn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (errorClass && !(error instanceof errorClass)) {
      throw new Error(`Expected error to be instance of ${errorClass.name}, got ${error.constructor.name}`)
    }

    if (message) {
      const errorMessage = (error as Error).message
      if (typeof message === 'string') {
        if (!errorMessage.includes(message)) {
          throw new Error(`Expected error message to include "${message}", got "${errorMessage}"`)
        }
      } else {
        if (!message.test(errorMessage)) {
          throw new Error(`Expected error message to match ${message}, got "${errorMessage}"`)
        }
      }
    }

    return error as E
  }
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`
}

/**
 * Generate random UUID
 */
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
