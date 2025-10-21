/**
 * Auth DTOs - Validation schemas for authentication operations
 * Extends base schemas from @big0290/db-config
 */

import { z } from 'zod'
import { insertUserSchema } from '@big0290/db-config'

/**
 * Login request schema
 */
export const loginRequestSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

/**
 * Signup request schema
 */
export const signupRequestSchema = z
  .object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignupRequest = z.infer<typeof signupRequestSchema>

/**
 * Update user request schema
 * Omits id, email, createdAt, updatedAt (immutable fields)
 */
export const updateUserRequestSchema = insertUserSchema
  .partial()
  .omit({
    id: true,
    email: true, // Email updates require separate verification flow
    emailVerified: true, // Only updated via verification flow
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(2).max(100).optional(),
    image: z.string().url('Invalid image URL').optional(),
  })

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

/**
 * Password reset confirm schema
 */
export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>

/**
 * Change password schema (for authenticated users)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export type ChangePassword = z.infer<typeof changePasswordSchema>

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export type EmailVerification = z.infer<typeof emailVerificationSchema>

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export type ResendVerification = z.infer<typeof resendVerificationSchema>
