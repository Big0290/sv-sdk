/**
 * Authentication flows
 * Login, signup, logout, email verification, password reset
 */

import { auth } from './auth-config.js'
import { enforcePasswordPolicy } from './password-policy.js'
import { updateLastLogin } from './user-service.js'
import { enforceRateLimit, RATE_LIMITS } from '@big0290/security'
import { validateRequest } from '@big0290/validators'
import { loginRequestSchema, signupRequestSchema, type LoginRequest, type SignupRequest } from '@big0290/validators'
import { AuthenticationError, logger, type Result, ok, err } from '@big0290/shared'

/**
 * Login user
 * Enforces rate limiting and updates last login timestamp
 */
export async function login(
  request: LoginRequest,
  metadata: { ipAddress: string; userAgent?: string }
): Promise<
  Result<
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any
    },
    Error
  >
> {
  try {
    // Validate request
    const validation = validateRequest(loginRequestSchema, request)
    if (!validation.success) {
      return err(validation.error)
    }

    const { email, password } = validation.data

    // Enforce rate limiting
    await enforceRateLimit({
      ...RATE_LIMITS.LOGIN,
      identifier: metadata.ipAddress,
      resource: '/auth/login',
    })

    // Use BetterAuth to verify credentials
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })

    if (!result || !result.user) {
      logger.warn('Login failed - invalid credentials', { email, ipAddress: metadata.ipAddress })

      // Note: Log failed login when audit package is available
      // await logAudit('user.login.failed', { email, ipAddress: metadata.ipAddress })

      return err(new AuthenticationError('Invalid email or password'))
    }

    // Update last login
    await updateLastLogin(result.user.id)

    logger.info('User logged in successfully', { userId: result.user.id, email })

    // Note: Log successful login when audit package is available
    // await logAudit('user.login', { userId: result.user.id, ipAddress: metadata.ipAddress })

    return ok({
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    logger.error('Login error', error as Error)
    return err(error as Error)
  }
}

/**
 * Signup user
 * Enforces rate limiting and password policy
 */
export async function signup(
  request: SignupRequest,
  metadata: { ipAddress: string; userAgent?: string }
): Promise<
  Result<
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any
    },
    Error
  >
> {
  try {
    // Validate request
    const validation = validateRequest(signupRequestSchema, request)
    if (!validation.success) {
      return err(validation.error)
    }

    const { email, password, name } = validation.data

    // Enforce rate limiting
    await enforceRateLimit({
      ...RATE_LIMITS.SIGNUP,
      identifier: metadata.ipAddress,
      resource: '/auth/signup',
    })

    // Enforce password policy
    await enforcePasswordPolicy(password)

    // Use BetterAuth to create user
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || 'User',
      },
    })

    if (!result || !result.user) {
      logger.error('Signup failed', undefined, { email: email || undefined })
      return err(new Error('Failed to create user'))
    }

    logger.info('User signed up successfully', { userId: result.user.id, email })

    // Note: Log user creation when audit package is available
    // await logAudit('user.created', { userId: result.user.id, email })

    // Note: Send verification email when email package is available
    // await sendVerificationEmail(result.user)

    return ok({
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    logger.error('Signup error', error as Error)
    return err(error as Error)
  }
}

/**
 * Logout user
 */
export async function logout(sessionToken: string): Promise<Result<void, Error>> {
  try {
    await auth.api.signOut({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    })

    logger.info('User logged out successfully')

    // Note: Log logout when audit package is available
    // await logAudit('user.logout', { sessionToken })

    return ok(undefined)
  } catch (error) {
    logger.error('Logout error', error as Error)
    return err(error as Error)
  }
}

/**
 * Get current session
 */
export async function getSession(sessionToken: string): Promise<
  Result<
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any
    } | null,
    Error
  >
> {
  try {
    const result = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    })

    if (!result || !result.session) {
      return ok(null)
    }

    return ok({
      user: result.user,
      session: result.session,
    })
  } catch (error) {
    logger.error('Get session error', error as Error)
    return err(error as Error)
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string,
  metadata: { ipAddress: string }
): Promise<Result<void, Error>> {
  try {
    // Enforce rate limiting
    await enforceRateLimit({
      ...RATE_LIMITS.PASSWORD_RESET,
      identifier: metadata.ipAddress,
      resource: '/auth/reset-password',
    })

    // Use BetterAuth to generate reset token
    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: '/reset-password',
      },
    })

    logger.info('Password reset requested', { email })

    // Note: Log event when audit package is available
    // await logAudit('password.reset.requested', { email, ipAddress: metadata.ipAddress })

    // Note: Send reset email when email package is available
    // await sendPasswordResetEmail(email, resetToken)

    return ok(undefined)
  } catch (error) {
    logger.error('Request password reset error', error as Error)
    return err(error as Error)
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<Result<void, Error>> {
  try {
    await auth.api.verifyEmail({
      query: {
        token,
      },
    })

    logger.info('Email verified successfully')

    // Note: Log event when audit package is available
    // await logAudit('email.verified', { token })

    return ok(undefined)
  } catch (error) {
    logger.error('Email verification error', error as Error)
    return err(error as Error)
  }
}
