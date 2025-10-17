/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest'
import { validateRequest } from '../validation-utils.js'
import { z } from 'zod'

const testSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  name: z.string().min(2),
})

describe('validateRequest', () => {
  it('should validate valid data successfully', () => {
    const data = {
      email: 'test@example.com',
      age: 25,
      name: 'John Doe',
    }

    const result = validateRequest(testSchema, data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
    }
  })

  it('should return errors for invalid data', () => {
    const data = {
      email: 'invalid-email',
      age: 15,
      name: 'J',
    }

    const result = validateRequest(testSchema, data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it('should handle missing required fields', () => {
    const data = {
      email: 'test@example.com',
    }

    const result = validateRequest(testSchema, data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
      expect(result.errors.some((e) => e.field === 'age')).toBe(true)
      expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    }
  })

  it('should transform data during validation', () => {
    const schemaWithTransform = z.object({
      email: z.string().email().toLowerCase(),
    })

    const data = { email: 'TEST@EXAMPLE.COM' }

    const result = validateRequest(schemaWithTransform, data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })
})

