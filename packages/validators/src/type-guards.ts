/**
 * Type guards for runtime type checking
 */

import type { ApiSuccessResponse, ApiErrorResponse } from './api-types.js'

/**
 * Check if API response is successful
 */
export function isSuccessResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  )
}

/**
 * Check if API response is error
 */
export function isErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  )
}

/**
 * Check if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Check if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Check if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Check if value is object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check if value is array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Check if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * Check if value is email
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Check if value is URL
 */
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is UUID
 */
export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Assertion function that throws if condition is false
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

/**
 * Assert value is string
 */
export function assertString(value: unknown, message?: string): asserts value is string {
  assert(isString(value), message || 'Value must be a string')
}

/**
 * Assert value is number
 */
export function assertNumber(value: unknown, message?: string): asserts value is number {
  assert(isNumber(value), message || 'Value must be a number')
}

/**
 * Assert value is not null or undefined
 */
export function assertDefined<T>(value: T, message?: string): asserts value is NonNullable<T> {
  assert(!isNullish(value), message || 'Value must be defined')
}
