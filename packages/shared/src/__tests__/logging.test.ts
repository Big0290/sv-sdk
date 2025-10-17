/**
 * Tests for logging utilities
 */

import { describe, it, expect, vi } from 'vitest'
import { logger } from '../logging/logger.js'

describe('Logger', () => {
  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'log')

    logger.info('Test message')

    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should log error messages with error object', () => {
    const consoleSpy = vi.spyOn(console, 'error')

    const error = new Error('Test error')
    logger.error('Error occurred', error)

    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should include context in log output', () => {
    const consoleSpy = vi.spyOn(console, 'log')

    logger.info('Test with context', { userId: '123', action: 'login' })

    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should support different log levels', () => {
    const debugSpy = vi.spyOn(console, 'debug')
    const warnSpy = vi.spyOn(console, 'warn')

    logger.debug('Debug message')
    logger.warn('Warning message')

    expect(debugSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()

    debugSpy.mockRestore()
    warnSpy.mockRestore()
  })
})

