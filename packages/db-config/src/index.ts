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

// Re-export commonly used drizzle-orm functions
export { eq, like, and, or, desc, asc, lt, lte, gt, gte } from 'drizzle-orm'

// Export all schema tables and types
export * from './schemas/auth.schema.js'
export * from './schemas/email.schema.js'
export * from './schemas/audit.schema.js'
export * from './schemas/permissions.schema.js'
