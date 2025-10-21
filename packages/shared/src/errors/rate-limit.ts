import { SDKError } from './base.js'

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends SDKError {
  public readonly limit: number | undefined
  public readonly window: number | undefined
  public readonly retryAfter: number | undefined

  constructor(
    message: string,
    options: {
      limit?: number
      window?: number
      retryAfter?: number
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      ...(options.details && { details: options.details }),
      ...(options.cause && { cause: options.cause }),
    })

    this.limit = options.limit
    this.window = options.window
    this.retryAfter = options.retryAfter
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      limit: this.limit,
      window: this.window,
      retryAfter: this.retryAfter,
    }
  }
}
