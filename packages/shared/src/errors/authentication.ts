import { SDKError } from './base.js'

/**
 * Error thrown when authentication fails
 * Used for login failures, invalid credentials, expired tokens, etc.
 */
export class AuthenticationError extends SDKError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      ...(options.details && { details: options.details }),
      ...(options.cause && { cause: options.cause }),
    })
  }
}

/**
 * Error thrown when session is invalid or expired
 */
export class SessionError extends SDKError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'SESSION_ERROR',
      statusCode: 401,
      ...(options.details && { details: options.details }),
      ...(options.cause && { cause: options.cause }),
    })
  }
}

/**
 * Error thrown when account is locked or disabled
 */
export class AccountLockedError extends SDKError {
  public readonly lockedUntil: Date | undefined

  constructor(
    message: string,
    options: {
      lockedUntil?: Date
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'ACCOUNT_LOCKED',
      statusCode: 403,
      ...(options.details && { details: options.details }),
      ...(options.cause && { cause: options.cause }),
    })

    this.lockedUntil = options.lockedUntil
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      lockedUntil: this.lockedUntil?.toISOString(),
    }
  }
}
