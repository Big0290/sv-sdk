/**
 * Database configuration package
 * Exports database client, schemas, and utilities
 */

// Export database client and utilities
export {
  db,
  sql,
  checkConnection,
  checkSchemas,
  getConnectionStats,
  closeConnections,
  type Database,
} from './client.js'

// Export all schema tables and types
export * from './schemas/auth.schema.js'
export * from './schemas/email.schema.js'
export * from './schemas/audit.schema.js'
export * from './schemas/permissions.schema.js'
