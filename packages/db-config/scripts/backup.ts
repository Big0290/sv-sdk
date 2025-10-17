/**
 * Database backup script
 * Uses pg_dump to create backups
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

const BACKUP_DIR = process.env.BACKUP_DIR || './backups'
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function backup() {
  console.log('💾 Starting database backup...\n')

  try {
    // Create backups directory if it doesn't exist
    await fs.mkdir(BACKUP_DIR, { recursive: true })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.sql`
    const filepath = path.join(BACKUP_DIR, filename)

    console.log(`📁 Backup file: ${filepath}\n`)

    // Run pg_dump
    console.log('🔄 Running pg_dump...')
    execSync(`pg_dump ${DATABASE_URL} > ${filepath}`, {
      stdio: 'inherit',
    })

    console.log('✅ Backup created successfully\n')

    // Get file size
    const stats = await fs.stat(filepath)
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2)

    console.log(`📊 Backup size: ${sizeInMB} MB`)
    console.log(`📍 Location: ${filepath}`)

    // Compress backup (optional)
    if (process.env.COMPRESS_BACKUP === 'true') {
      console.log('\n🗜️  Compressing backup...')
      execSync(`gzip ${filepath}`, { stdio: 'inherit' })
      console.log(`✅ Backup compressed: ${filepath}.gz`)
    }

    console.log('\n🎉 Backup completed successfully!')
  } catch (error) {
    console.error('\n❌ Backup failed:', error)
    process.exit(1)
  }
}

backup()
