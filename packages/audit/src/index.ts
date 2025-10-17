/**
 * Audit logging package
 * Export audit functions, PII handling, and retention utilities
 */

// Audit logging
export { logAudit, logAuditBulk, flushBatch, shutdownAuditLogger, type AuditLogOptions } from './log-audit.js'

// PII handling
export {
  maskPII,
  maskValue,
  isPIIField,
  configurePIIFields,
  detectEmail,
  detectPhone,
  detectCreditCard,
  maskPIIInText,
} from './pii-handler.js'

// Query functions
export {
  fetchAuditLogs,
  getAuditLogById,
  exportAuditLogsJSON,
  exportAuditLogsCSV,
  searchAuditLogs,
  countByEventType,
  type AuditLogFilters,
  type AuditLogSort,
} from './query-audit.js'

// Retention policies
export {
  applyRetentionPolicy,
  getRetentionStats,
  checkRetentionCompliance,
  DEFAULT_RETENTION_POLICY,
  type RetentionPolicy,
} from './retention.js'

// Integrity
export {
  generateHash,
  verifyHash,
  verifyHashChain,
  generateExportSignature,
  verifyExportSignature,
} from './integrity.js'
