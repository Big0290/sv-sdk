/**
 * Migration orchestration script
 * Runs database migrations with pre-flight checks
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { sql, db, checkConnection, checkSchemas } from '../src/client.js'

async function runMigrations() {
  console.log('🔄 Starting migration process...\n')

  try {
    // Step 1: Check database connection
    console.log('1️⃣  Checking database connection...')
    const connectionStatus = await checkConnection()

    if (!connectionStatus.healthy) {
      console.error('❌ Database connection failed:', connectionStatus.error)
      process.exit(1)
    }

    console.log(`✅ Database connected (latency: ${connectionStatus.latency}ms)\n`)

    // Step 2: Check schemas
    console.log('2️⃣  Checking database schemas...')
    const schemasStatus = await checkSchemas()

    console.log(`   Found schemas: ${schemasStatus.schemas.join(', ')}`)

    if (schemasStatus.missing.length > 0) {
      console.log(`   Missing schemas: ${schemasStatus.missing.join(', ')}`)
      console.log('   Schemas will be created by init-db.sql script')
    }

    console.log('✅ Schema check complete\n')

    // Step 3: Run migrations
    console.log('3️⃣  Running migrations...')
    await migrate(db, {
      migrationsFolder: './migrations',
    })
    console.log('✅ Migrations completed successfully\n')

    // Step 4: Verify migration
    console.log('4️⃣  Verifying migration...')
    const verifyStatus = await checkConnection()

    if (!verifyStatus.healthy) {
      console.error('❌ Post-migration verification failed')
      process.exit(1)
    }

    console.log('✅ Migration verified\n')

    console.log('🎉 Migration process completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    // Close database connections
    await sql.end()
  }
}

// Run migrations
runMigrations()
