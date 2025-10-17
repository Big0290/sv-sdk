import { SDKError } from './base.js'

/**
 * Error thrown when user lacks required permissions
 * Used for authorization failures
 */
export class PermissionError extends SDKError {
  public readonly requiredPermission?: string
  public readonly resource?: string

  constructor(
    message: string,
    options: {
      requiredPermission?: string
      resource?: string
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'PERMISSION_DENIED',
      statusCode: 403,
      details: options.details,
      cause: options.cause,
    })

    this.requiredPermission = options.requiredPermission
    this.resource = options.resource
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
      resource: this.resource,
    }
  }
}

/**
 * Error thrown when role is not found or invalid
 */
export class RoleError extends SDKError {
  constructor(
    message: string,
    options: {
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: 'ROLE_ERROR',
      statusCode: 400,
      details: options.details,
      cause: options.cause,
    })
  }
}
