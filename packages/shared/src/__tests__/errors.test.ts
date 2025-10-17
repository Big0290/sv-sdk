import { describe, it, expect } from 'vitest'
import {
  SDKError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  DatabaseError,
  NotFoundError,
  ExternalServiceError,
  RateLimitError,
} from '../errors/index.js'

describe('SDKError', () => {
  it('should create basic error', () => {
    const error = new SDKError('Test error')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(SDKError)
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('SDKError')
    expect(error.code).toBe('SDK_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.timestamp).toBeInstanceOf(Date)
  })

  it('should create error with custom options', () => {
    const error = new SDKError('Test error', {
      code: 'CUSTOM_CODE',
      statusCode: 400,
      details: { foo: 'bar' },
    })

    expect(error.code).toBe('CUSTOM_CODE')
    expect(error.statusCode).toBe(400)
    expect(error.details).toEqual({ foo: 'bar' })
  })

  it('should serialize to JSON', () => {
    const error = new SDKError('Test error', {
      code: 'TEST_CODE',
      details: { foo: 'bar' },
    })

    const json = error.toJSON()

    expect(json.name).toBe('SDKError')
    expect(json.message).toBe('Test error')
    expect(json.code).toBe('TEST_CODE')
    expect(json.statusCode).toBe(500)
    expect(json.details).toEqual({ foo: 'bar' })
    expect(json.timestamp).toBeDefined()
  })

  it('should create from unknown error', () => {
    const nativeError = new Error('Native error')
    const sdkError = SDKError.fromUnknown(nativeError)

    expect(sdkError).toBeInstanceOf(SDKError)
    expect(sdkError.message).toBe('Native error')
  })

  it('should create from string', () => {
    const sdkError = SDKError.fromUnknown('String error')

    expect(sdkError).toBeInstanceOf(SDKError)
    expect(sdkError.message).toBe('String error')
  })

  it('should create from unknown type', () => {
    const sdkError = SDKError.fromUnknown({ foo: 'bar' })

    expect(sdkError).toBeInstanceOf(SDKError)
    expect(sdkError.message).toBe('Unknown error occurred')
  })
})

describe('ValidationError', () => {
  it('should create validation error', () => {
    const error = new ValidationError('Invalid input')

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('should include field and errors', () => {
    const error = new ValidationError('Invalid input', {
      field: 'email',
      errors: [{ field: 'email', message: 'Invalid format' }],
    })

    expect(error.field).toBe('email')
    expect(error.errors).toHaveLength(1)
  })
})

describe('AuthenticationError', () => {
  it('should create authentication error', () => {
    const error = new AuthenticationError('Invalid credentials')

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.code).toBe('AUTHENTICATION_ERROR')
    expect(error.statusCode).toBe(401)
  })
})

describe('PermissionError', () => {
  it('should create permission error', () => {
    const error = new PermissionError('Access denied', {
      requiredPermission: 'admin:read',
      resource: 'users',
    })

    expect(error).toBeInstanceOf(PermissionError)
    expect(error.code).toBe('PERMISSION_DENIED')
    expect(error.statusCode).toBe(403)
    expect(error.requiredPermission).toBe('admin:read')
    expect(error.resource).toBe('users')
  })
})

describe('DatabaseError', () => {
  it('should create database error', () => {
    const error = new DatabaseError('Query failed', {
      query: 'SELECT * FROM users',
      table: 'users',
    })

    expect(error).toBeInstanceOf(DatabaseError)
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.query).toBe('SELECT * FROM users')
    expect(error.table).toBe('users')
  })
})

describe('NotFoundError', () => {
  it('should create not found error', () => {
    const error = new NotFoundError('User not found', {
      resource: 'user',
      resourceId: '123',
    })

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.resource).toBe('user')
    expect(error.resourceId).toBe('123')
  })
})

describe('ExternalServiceError', () => {
  it('should create external service error', () => {
    const error = new ExternalServiceError('Email service failed', {
      service: 'brevo',
      serviceStatusCode: 503,
    })

    expect(error).toBeInstanceOf(ExternalServiceError)
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
    expect(error.statusCode).toBe(502)
    expect(error.service).toBe('brevo')
    expect(error.serviceStatusCode).toBe(503)
  })
})

describe('RateLimitError', () => {
  it('should create rate limit error', () => {
    const error = new RateLimitError('Too many requests', {
      limit: 100,
      window: 900000,
      retryAfter: 60,
    })

    expect(error).toBeInstanceOf(RateLimitError)
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(error.statusCode).toBe(429)
    expect(error.limit).toBe(100)
    expect(error.window).toBe(900000)
    expect(error.retryAfter).toBe(60)
  })
})
