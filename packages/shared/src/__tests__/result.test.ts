import { describe, it, expect } from 'vitest'
import {
  ok,
  err,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  map,
  mapError,
  tryCatch,
  tryCatchSync,
} from '../types/result.js'

describe('Result type', () => {
  describe('ok', () => {
    it('should create successful result', () => {
      const result = ok(42)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(42)
      }
    })
  })

  describe('err', () => {
    it('should create failed result', () => {
      const error = new Error('Failed')
      const result = err(error)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe(error)
      }
    })
  })

  describe('isSuccess', () => {
    it('should return true for successful result', () => {
      const result = ok(42)
      expect(isSuccess(result)).toBe(true)
    })

    it('should return false for failed result', () => {
      const result = err(new Error('Failed'))
      expect(isSuccess(result)).toBe(false)
    })
  })

  describe('isFailure', () => {
    it('should return true for failed result', () => {
      const result = err(new Error('Failed'))
      expect(isFailure(result)).toBe(true)
    })

    it('should return false for successful result', () => {
      const result = ok(42)
      expect(isFailure(result)).toBe(false)
    })
  })

  describe('unwrap', () => {
    it('should return value for successful result', () => {
      const result = ok(42)
      expect(unwrap(result)).toBe(42)
    })

    it('should throw error for failed result', () => {
      const error = new Error('Failed')
      const result = err(error)
      expect(() => unwrap(result)).toThrow(error)
    })
  })

  describe('unwrapOr', () => {
    it('should return value for successful result', () => {
      const result = ok(42)
      expect(unwrapOr(result, 0)).toBe(42)
    })

    it('should return default for failed result', () => {
      const result = err(new Error('Failed'))
      expect(unwrapOr(result, 0)).toBe(0)
    })
  })

  describe('map', () => {
    it('should map successful result', () => {
      const result = ok(42)
      const mapped = map(result, (x) => x * 2)

      expect(isSuccess(mapped)).toBe(true)
      if (isSuccess(mapped)) {
        expect(mapped.data).toBe(84)
      }
    })

    it('should not map failed result', () => {
      const error = new Error('Failed')
      const result = err(error)
      const mapped = map(result, (x: number) => x * 2)

      expect(isFailure(mapped)).toBe(true)
      if (isFailure(mapped)) {
        expect(mapped.error).toBe(error)
      }
    })
  })

  describe('mapError', () => {
    it('should not map successful result', () => {
      const result = ok(42)
      const mapped = mapError(result, (e) => new Error(`Wrapped: ${e.message}`))

      expect(isSuccess(mapped)).toBe(true)
      if (isSuccess(mapped)) {
        expect(mapped.data).toBe(42)
      }
    })

    it('should map failed result', () => {
      const result = err(new Error('Original'))
      const mapped = mapError(result, (e) => new Error(`Wrapped: ${e.message}`))

      expect(isFailure(mapped)).toBe(true)
      if (isFailure(mapped)) {
        expect(mapped.error.message).toBe('Wrapped: Original')
      }
    })
  })

  describe('tryCatch', () => {
    it('should return ok for successful promise', async () => {
      const result = await tryCatch(async () => 42)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(42)
      }
    })

    it('should return err for rejected promise', async () => {
      const result = await tryCatch(async () => {
        throw new Error('Failed')
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toBe('Failed')
      }
    })
  })

  describe('tryCatchSync', () => {
    it('should return ok for successful function', () => {
      const result = tryCatchSync(() => 42)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(42)
      }
    })

    it('should return err for throwing function', () => {
      const result = tryCatchSync(() => {
        throw new Error('Failed')
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toBe('Failed')
      }
    })
  })
})
