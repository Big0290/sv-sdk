/**
 * Password policy enforcement
 */

import { validatePasswordStrength, checkPasswordBreach } from '@big0290/validators'
import { ValidationError, logger } from '@big0290/shared'

/**
 * Password policy configuration
 */
export interface PasswordPolicyConfig {
  /**
   * Minimum password length
   */
  minLength?: number

  /**
   * Require uppercase letter
   */
  requireUppercase?: boolean

  /**
   * Require lowercase letter
   */
  requireLowercase?: boolean

  /**
   * Require number
   */
  requireNumber?: boolean

  /**
   * Require special character
   */
  requireSpecialChar?: boolean

  /**
   * Check against breach database
   */
  checkBreaches?: boolean

  /**
   * Minimum password strength score (0-4)
   */
  minStrengthScore?: number
}

/**
 * Default password policy
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  checkBreaches: true,
  minStrengthScore: 2,
}

/**
 * Enforce password policy
 * Throws ValidationError if password doesn't meet requirements
 */
export async function enforcePasswordPolicy(
  password: string,
  policy: PasswordPolicyConfig = DEFAULT_PASSWORD_POLICY
): Promise<void> {
  // Validate password strength
  const strength = validatePasswordStrength(password)

  if (!strength.valid) {
    logger.warn('Password policy violation', { feedback: strength.feedback })

    throw new ValidationError('Password does not meet requirements', {
      field: 'password',
      errors: strength.feedback.map((message) => ({
        field: 'password',
        message,
      })),
      details: {
        requirements: strength.requirements,
        strength: strength.strength,
        score: strength.score,
      },
    })
  }

  // Check minimum strength score
  if (policy.minStrengthScore && strength.score < policy.minStrengthScore) {
    throw new ValidationError('Password is too weak', {
      field: 'password',
      details: {
        score: strength.score,
        minScore: policy.minStrengthScore,
      },
    })
  }

  // Check against breach database
  if (policy.checkBreaches) {
    const isBreached = await checkPasswordBreach(password)

    if (isBreached) {
      logger.warn('Password found in breach database')

      throw new ValidationError('This password has been found in a data breach. Please use a different password.', {
        field: 'password',
        details: {
          reason: 'password_breached',
        },
      })
    }
  }

  logger.debug('Password policy check passed', { strength: strength.strength })
}

/**
 * Validate password against policy without throwing
 * Returns validation result
 */
export async function validatePassword(
  password: string,
  policy: PasswordPolicyConfig = DEFAULT_PASSWORD_POLICY
): Promise<{
  valid: boolean
  errors: string[]
  strength: string
  score: number
}> {
  const strength = validatePasswordStrength(password)
  const errors: string[] = []

  if (!strength.valid) {
    errors.push(...strength.feedback)
  }

  if (policy.minStrengthScore && strength.score < policy.minStrengthScore) {
    errors.push(`Password strength too low (score: ${strength.score}, required: ${policy.minStrengthScore})`)
  }

  if (policy.checkBreaches) {
    const isBreached = await checkPasswordBreach(password)
    if (isBreached) {
      errors.push('Password found in breach database')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: strength.strength,
    score: strength.score,
  }
}
