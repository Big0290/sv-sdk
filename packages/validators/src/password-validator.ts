/**
 * Password validator with strength checking
 */

import { z } from 'zod'

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  valid: boolean
  score: number // 0-4
  strength: PasswordStrength
  feedback: string[]
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

/**
 * Validate password strength
 * Returns detailed feedback for user
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = []
  let score = 0

  // Check requirements
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  }

  // Provide feedback
  if (!requirements.minLength) {
    feedback.push('Password must be at least 12 characters long')
  } else {
    score++
  }

  if (!requirements.hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score++
  }

  if (!requirements.hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score++
  }

  if (!requirements.hasNumber) {
    feedback.push('Password must contain at least one number')
  } else {
    score++
  }

  if (!requirements.hasSpecialChar) {
    feedback.push('Password must contain at least one special character (!@#$%^&*)')
  } else {
    score++
  }

  // Additional checks for strength
  if (password.length >= 16) {
    score += 0.5
    feedback.push('Good: Password is 16+ characters')
  }

  // Check for common patterns
  const commonPatterns = [
    /^123/,
    /^abc/i,
    /password/i,
    /qwerty/i,
    /admin/i,
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1
      feedback.push('Avoid common patterns and repeated characters')
      break
    }
  }

  // Normalize score to 0-4
  score = Math.max(0, Math.min(4, Math.floor(score)))

  // Determine strength
  let strength: PasswordStrength
  if (score === 0 || score === 1) {
    strength = PasswordStrength.WEAK
  } else if (score === 2) {
    strength = PasswordStrength.MODERATE
  } else if (score === 3) {
    strength = PasswordStrength.STRONG
  } else {
    strength = PasswordStrength.VERY_STRONG
  }

  // Valid if all requirements met
  const valid = Object.values(requirements).every((req) => req)

  return {
    valid,
    score,
    strength,
    feedback: valid ? [`Password strength: ${strength}`] : feedback,
    requirements,
  }
}

/**
 * Check if password has been breached
 * Uses k-anonymity with Have I Been Pwned API
 * Note: In production, implement actual API call
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkPasswordBreach(_password: string): Promise<boolean> {
  // TODO: Implement HaveIBeenPwned API integration
  // For now, return false (not breached)
  //
  // Implementation steps:
  // 1. Hash password with SHA-1
  // 2. Take first 5 characters of hash
  // 3. Send to HIBP API: https://api.pwnedpasswords.com/range/{first5}
  // 4. Check if remaining hash exists in response
  // 5. Return true if found in breach database

  return false
}

/**
 * Generate a strong password
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()-_=+[]{}|;:,.<>?'

  const allChars = lowercase + uppercase + numbers + special

  let password = ''

  // Ensure at least one of each required character type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Zod schema for strong password
 */
export const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .superRefine((password, ctx) => {
    const result = validatePasswordStrength(password)

    if (!result.valid) {
      result.feedback.forEach((message) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        })
      })
    }
  })
