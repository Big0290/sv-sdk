/**
 * Result type for operations that can fail
 * Inspired by Rust's Result<T, E> type
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

/**
 * Type guard for successful result
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Type guard for failed result
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

/**
 * Create a successful result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * Create a failed result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Unwrap result value or throw error
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.success) {
    return result.data
  }
  throw result.error
}

/**
 * Unwrap result value or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.data
  }
  return defaultValue
}

/**
 * Map result value with function
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.success) {
    return ok(fn(result.data))
  }
  return result
}

/**
 * Map error with function
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (result.success) {
    return result
  }
  return err(fn(result.error))
}

/**
 * Async Result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>

/**
 * Wrap async function to return Result
 */
export async function tryCatch<T>(fn: () => Promise<T>): AsyncResult<T, Error> {
  try {
    const data = await fn()
    return ok(data)
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Wrap sync function to return Result
 */
export function tryCatchSync<T>(fn: () => T): Result<T, Error> {
  try {
    const data = fn()
    return ok(data)
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
