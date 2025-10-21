/**
 * Database client with connection pooling
 * Single PostgreSQL database with multiple schemas
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Import all schemas
import * as authSchema from './schemas/auth.schema.js'
import * as emailSchema from './schemas/email.schema.js'
import * as auditSchema from './schemas/audit.schema.js'
import * as permissionsSchema from './schemas/permissions.schema.js'

// Combine all schemas
const schema = {
  ...authSchema,
  ...emailSchema,
  ...auditSchema,
  ...permissionsSchema,
}

// Lazy-loaded database connection
let _sql: postgres.Sql | null = null
let _db: ReturnType<typeof drizzle> | null = null

function getConnection() {
  if (!_sql) {
    const DATABASE_URL = process.env.DATABASE_URL

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Create postgres connection with connection pooling
    _sql = postgres(DATABASE_URL, {
      max: parseInt(process.env.DB_POOL_SIZE || '20'), // Connection pool size
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    })

    // Create Drizzle instance
    _db = drizzle(_sql, { schema })
  }

  return { sql: _sql, db: _db! }
}

// Export lazy-loaded instances via getters
export const sql = new Proxy({} as postgres.Sql, {
  get(_target, prop) {
    const { sql } = getConnection()
    return sql[prop as keyof postgres.Sql]
  },
  apply(_target, _thisArg, args) {
    const { sql } = getConnection()
    return (sql as unknown as (...args: unknown[]) => unknown)(...args)
  },
})

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const { db } = getConnection()
    return db[prop as keyof typeof db]
  },
})

/**
 * Health check function
 * Verifies database connection is working
 */
export async function checkConnection(): Promise<{
  healthy: boolean
  latency?: number
  error?: string
}> {
  try {
    const start = Date.now()
    await sql`SELECT 1 as test`
    const latency = Date.now() - start

    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Check if all schemas exist
 */
export async function checkSchemas(): Promise<{
  exists: boolean
  schemas: string[]
  missing: string[]
}> {
  try {
    const result = await sql<{ schema_name: string }[]>`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'email', 'audit', 'permissions')
    `

    const existingSchemas = result.map((row) => row.schema_name)
    const expectedSchemas = ['auth', 'email', 'audit', 'permissions']
    const missing = expectedSchemas.filter((s) => !existingSchemas.includes(s))

    return {
      exists: missing.length === 0,
      schemas: existingSchemas,
      missing,
    }
  } catch {
    return {
      exists: false,
      schemas: [],
      missing: ['auth', 'email', 'audit', 'permissions'],
    }
  }
}

/**
 * Get connection pool stats
 */
export async function getConnectionStats() {
  return {
    maxConnections: sql.options.max,
    idleTimeout: sql.options.idle_timeout,
    connectTimeout: sql.options.connect_timeout,
  }
}

/**
 * Close all database connections
 * Should be called on application shutdown
 */
export async function closeConnections(): Promise<void> {
  if (_sql) {
    await _sql.end()
  }
}

// Export types
export type Database = typeof db
export * from './schemas/auth.schema.js'
export * from './schemas/email.schema.js'
export * from './schemas/audit.schema.js'
export * from './schemas/permissions.schema.js'
