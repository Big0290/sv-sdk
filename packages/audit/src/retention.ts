/**
 * Audit log retention policies
 */

import { db, auditLogs } from '@sv-sdk/db-config'
import { lt } from '@sv-sdk/db-config'
import { logger } from '@sv-sdk/shared'
import fs from 'fs/promises'
import path from 'path'

/**
 * Retention policy configuration
 */
export interface RetentionPolicy {
  /**
   * Number of days to retain logs
   */
  retentionDays: number

  /**
   * Archive logs before deletion
   */
  archiveBeforeDelete: boolean

  /**
   * Archive directory (if archiving)
   */
  archiveDir?: string

  /**
   * Compress archives
   */
  compressArchives?: boolean
}

/**
 * Default retention policy
 */
export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  retentionDays: 365, // 1 year
  archiveBeforeDelete: true,
  archiveDir: './archives',
  compressArchives: true,
}

/**
 * Apply retention policy
 * Deletes logs older than retention period
 */
export async function applyRetentionPolicy(policy: RetentionPolicy = DEFAULT_RETENTION_POLICY): Promise<{
  deleted: number
  archived: boolean
  archivePath?: string
}> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays)

    logger.info('Applying retention policy', {
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: policy.retentionDays,
    })

    // Get logs to delete
    const logsToDelete = await db.select().from(auditLogs).where(lt(auditLogs.createdAt, cutoffDate))

    if (logsToDelete.length === 0) {
      logger.info('No logs to delete')
      return { deleted: 0, archived: false }
    }

    let archivePath: string | undefined

    // Archive before deletion
    if (policy.archiveBeforeDelete && logsToDelete.length > 0) {
      logger.info('Archiving logs before deletion', { count: logsToDelete.length })

      const archiveDir = policy.archiveDir || './archives'
      await fs.mkdir(archiveDir, { recursive: true })

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `audit-logs-archive-${timestamp}.json`
      archivePath = path.join(archiveDir, filename)

      const exportData = {
        archivedAt: new Date().toISOString(),
        cutoffDate: cutoffDate.toISOString(),
        count: logsToDelete.length,
        logs: logsToDelete,
      }

      await fs.writeFile(archivePath, JSON.stringify(exportData, null, 2))

      // Compress if requested
      if (policy.compressArchives) {
        const { execSync } = await import('child_process')
        execSync(`gzip ${archivePath}`)
        archivePath = `${archivePath}.gz`
      }

      logger.info('Logs archived', { path: archivePath, count: logsToDelete.length })
    }

    // Delete logs
    const deleted = await db.delete(auditLogs).where(lt(auditLogs.createdAt, cutoffDate)).returning()

    logger.info('Retention policy applied', { deleted: deleted.length, archived: !!archivePath })

    return {
      deleted: deleted.length,
      archived: !!archivePath,
      archivePath,
    }
  } catch (error) {
    logger.error('Failed to apply retention policy', error as Error)
    throw error
  }
}

/**
 * Get retention statistics
 */
export async function getRetentionStats(): Promise<{
  totalLogs: number
  oldestLog: Date | null
  newestLog: Date | null
  averageAge: number // in days
}> {
  try {
    const logs = await db.select().from(auditLogs)

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        oldestLog: null,
        newestLog: null,
        averageAge: 0,
      }
    }

    const dates = logs.map((log) => log.createdAt)
    const oldest = new Date(Math.min(...dates.map((d) => d.getTime())))
    const newest = new Date(Math.max(...dates.map((d) => d.getTime())))

    // Calculate average age
    const now = Date.now()
    const totalAge = logs.reduce((sum, log) => sum + (now - log.createdAt.getTime()), 0)
    const averageAge = Math.floor(totalAge / logs.length / (1000 * 60 * 60 * 24)) // Convert to days

    return {
      totalLogs: logs.length,
      oldestLog: oldest,
      newestLog: newest,
      averageAge,
    }
  } catch (error) {
    logger.error('Failed to get retention stats', error as Error)
    throw error
  }
}

/**
 * Check compliance with retention policy
 */
export async function checkRetentionCompliance(policy: RetentionPolicy): Promise<{
  compliant: boolean
  logsToDelete: number
  oldestLog: Date | null
}> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays)

    const logsToDelete = await db.select().from(auditLogs).where(lt(auditLogs.createdAt, cutoffDate))

    const stats = await getRetentionStats()

    return {
      compliant: logsToDelete.length === 0,
      logsToDelete: logsToDelete.length,
      oldestLog: stats.oldestLog,
    }
  } catch (error) {
    logger.error('Failed to check retention compliance', error as Error)
    throw error
  }
}
