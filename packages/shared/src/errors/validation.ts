import { SDKError } from './base.js'

/**
 * Error thrown when validation fails
 * Used for input validation, schema validation, etc.
 */
export class ValidationError extends SDKError {
  public readonly field?: string
  public readonly errors?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    options: {
      field?: string
      errors?: Array<{ field: string; message: string }>
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: options.details,
      cause: options.cause,
    })

    this.field = options.field
    this.errors = options.errors
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      errors: this.errors,
    }
  }
}
