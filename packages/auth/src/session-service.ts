/**
 * Session management service
 */

import { db, sessions, type Session } from '@sv-sdk/db-config'
import { eq, lt, and } from '@sv-sdk/db-config'
import { cacheDelete, CACHE_KEYS } from '@sv-sdk/cache'
import { logger } from '@sv-sdk/shared'

/**
 * Get all sessions for user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  try {
    const userSessions = await db.select().from(sessions).where(eq(sessions.userId, userId))

    logger.debug('User sessions fetched', { userId, count: userSessions.length })

    return userSessions
  } catch (error) {
    logger.error('Failed to get user sessions', error as Error, { userId })
    return []
  }
}

/**
 * Revoke session by ID
 */
export async function revokeSession(sessionId: string): Promise<void> {
  try {
    const [revoked] = await db.delete(sessions).where(eq(sessions.id, sessionId)).returning()

    if (revoked) {
      // Invalidate session cache
      await cacheDelete(CACHE_KEYS.session(sessionId))

      logger.info('Session revoked', { sessionId })

      // Note: Log event when audit package is available
      // await logAudit('session.revoked', { sessionId, userId: revoked.userId })
    }
  } catch (error) {
    logger.error('Failed to revoke session', error as Error, { sessionId })
    throw error
  }
}

/**
 * Revoke all sessions for user (except current)
 */
export async function revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
  try {
    const conditions = [eq(sessions.userId, userId)]

    if (exceptSessionId) {
      // Don't revoke current session
      conditions.push(eq(sessions.id, exceptSessionId))
    }

    const result = await db
      .delete(sessions)
      .where(and(...conditions))
      .returning()

    // Invalidate cache for all revoked sessions
    for (const session of result) {
      await cacheDelete(CACHE_KEYS.session(session.id))
    }

    logger.info('User sessions revoked', { userId, count: result.length })

    return result.length
  } catch (error) {
    logger.error('Failed to revoke user sessions', error as Error, { userId })
    throw error
  }
}

/**
 * Clean expired sessions
 * Should be run periodically (e.g., daily cron job)
 */
export async function cleanExpiredSessions(): Promise<number> {
  try {
    const now = new Date()

    const result = await db.delete(sessions).where(lt(sessions.expiresAt, now)).returning()

    logger.info('Expired sessions cleaned', { count: result.length })

    return result.length
  } catch (error) {
    logger.error('Failed to clean expired sessions', error as Error)
    throw error
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)

    if (result.length === 0) {
      return null
    }

    const session = result[0]
    if (!session) {
      return null
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      logger.debug('Session expired', { sessionId })
      await revokeSession(sessionId)
      return null
    }

    return session
  } catch (error) {
    logger.error('Failed to get session', error as Error, { sessionId })
    return null
  }
}

/**
 * Count active sessions
 */
export async function countActiveSessions(): Promise<number> {
  try {
    const now = new Date()
    const result = await db.select().from(sessions).where(lt(sessions.expiresAt, now))

    return result.length
  } catch (error) {
    logger.error('Failed to count active sessions', error as Error)
    return 0
  }
}
