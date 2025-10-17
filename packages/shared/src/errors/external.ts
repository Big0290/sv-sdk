import { SDKError } from './base.js'

/**
 * Error thrown when external service calls fail
 * Used for email providers, payment gateways, third-party APIs, etc.
 */
export class ExternalServiceError extends SDKError {
  public readonly service?: string
  public readonly serviceStatusCode?: number

  constructor(
    message: string,
    options: {
      service?: string
      serviceStatusCode?: number
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'EXTERNAL_SERVICE_ERROR',
      statusCode: 502,
      details: options.details,
      cause: options.cause,
    })

    this.service = options.service
    this.serviceStatusCode = options.serviceStatusCode
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      service: this.service,
      serviceStatusCode: this.serviceStatusCode,
    }
  }
}

/**
 * Error thrown when external service times out
 */
export class TimeoutError extends SDKError {
  public readonly timeout?: number

  constructor(
    message: string,
    options: {
      timeout?: number
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'TIMEOUT_ERROR',
      statusCode: 504,
      details: options.details,
      cause: options.cause,
    })

    this.timeout = options.timeout
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      timeout: this.timeout,
    }
  }
}
