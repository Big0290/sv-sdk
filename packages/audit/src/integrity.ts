/**
 * Log integrity utilities
 * Cryptographic hash chain for tamper detection
 */

import crypto from 'crypto'
import { logger } from '@sv-sdk/shared'

/**
 * Generate hash for audit log entry
 * Uses SHA-256 for tamper detection
 */
export async function generateHash(
  eventType: string,
  metadata: Record<string, unknown>,
  previousHash?: string
): Promise<string> {
  try {
    const data = {
      eventType,
      metadata,
      previousHash: previousHash || '',
      timestamp: new Date().toISOString(),
    }

    const serialized = JSON.stringify(data)
    const hash = crypto.createHash('sha256').update(serialized).digest('hex')

    return hash
  } catch (error) {
    logger.error('Failed to generate audit hash', error as Error)
    return ''
  }
}

/**
 * Verify hash for audit log entry
 */
export async function verifyHash(
  hash: string,
  eventType: string,
  metadata: Record<string, unknown>,
  previousHash?: string
): Promise<boolean> {
  try {
    const expectedHash = await generateHash(eventType, metadata, previousHash)
    return hash === expectedHash
  } catch (error) {
    logger.error('Failed to verify audit hash', error as Error)
    return false
  }
}

/**
 * Verify hash chain for multiple audit logs
 * Returns true if all hashes are valid
 */
export async function verifyHashChain(
  logs: Array<{
    id: string
    hash: string
    eventType: string
    metadata: Record<string, unknown>
  }>
): Promise<{
  valid: boolean
  invalidLogs: string[]
}> {
  const invalidLogs: string[] = []

  let previousHash: string | undefined

  for (const log of logs) {
    const isValid = await verifyHash(log.hash, log.eventType, log.metadata, previousHash)

    if (!isValid) {
      invalidLogs.push(log.id)
    }

    previousHash = log.hash
  }

  return {
    valid: invalidLogs.length === 0,
    invalidLogs,
  }
}

/**
 * Generate signature for audit log export
 * Prevents tampering of exported logs
 */
export function generateExportSignature(logs: any[], secret: string): string {
  const data = JSON.stringify(logs)
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(data)
  return hmac.digest('hex')
}

/**
 * Verify export signature
 */
export function verifyExportSignature(logs: any[], signature: string, secret: string): boolean {
  const expectedSignature = generateExportSignature(logs, secret)
  return signature === expectedSignature
}
