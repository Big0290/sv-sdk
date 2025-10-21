/**
 * Base error class for all SDK errors
 * Extends native Error with additional context and serialization capabilities
 */
export class SDKError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details: Record<string, unknown> | undefined
  public readonly timestamp: Date

  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined)

    this.name = this.constructor.name
    this.code = options.code || 'SDK_ERROR'
    this.statusCode = options.statusCode || 500
    this.details = options.details
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Serialize error for logging or API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }

  /**
   * Create error from unknown caught error
   */
  static fromUnknown(error: unknown): SDKError {
    if (error instanceof SDKError) {
      return error
    }

    if (error instanceof Error) {
      return new SDKError(error.message, { cause: error })
    }

    if (typeof error === 'string') {
      return new SDKError(error)
    }

    return new SDKError('Unknown error occurred', {
      details: { error: String(error) },
    })
  }
}
