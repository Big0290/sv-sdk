/**
 * Authentication package
 * Export BetterAuth instance, user service, and auth utilities
 */

// BetterAuth instance
export { auth, type Session, type User } from './auth-config.js'

// User service
export {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  hardDeleteUser,
  updateLastLogin,
  countUsers,
  type UserFilters,
} from './user-service.js'

// Password policy
export {
  enforcePasswordPolicy,
  validatePassword,
  DEFAULT_PASSWORD_POLICY,
  type PasswordPolicyConfig,
} from './password-policy.js'

// Auth flows
export { login, signup, logout, getSession, requestPasswordReset, verifyEmail } from './auth-flows.js'

// Session service
export {
  getUserSessions,
  revokeSession,
  revokeAllUserSessions,
  cleanExpiredSessions,
  getSessionById,
  countActiveSessions,
} from './session-service.js'
