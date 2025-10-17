import { SDKError } from './base.js'

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends SDKError {
  public readonly query?: string
  public readonly table?: string

  constructor(
    message: string,
    options: {
      query?: string
      table?: string
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'DATABASE_ERROR',
      statusCode: 500,
      details: options.details,
      cause: options.cause,
    })

    this.query = options.query
    this.table = options.table
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      query: this.query,
      table: this.table,
    }
  }
}

/**
 * Error thrown when record is not found
 */
export class NotFoundError extends SDKError {
  public readonly resource?: string
  public readonly resourceId?: string

  constructor(
    message: string,
    options: {
      resource?: string
      resourceId?: string
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      details: options.details,
      cause: options.cause,
    })

    this.resource = options.resource
    this.resourceId = options.resourceId
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      resource: this.resource,
      resourceId: this.resourceId,
    }
  }
}

/**
 * Error thrown when constraint violation occurs
 */
export class ConstraintError extends SDKError {
  public readonly constraint?: string

  constructor(
    message: string,
    options: {
      constraint?: string
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'CONSTRAINT_VIOLATION',
      statusCode: 409,
      details: options.details,
      cause: options.cause,
    })

    this.constraint = options.constraint
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      constraint: this.constraint,
    }
  }
}
