/**
 * Database restore script
 * Restores database from backup file
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import { createInterface } from 'readline/promises'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function restore(backupFile: string) {
  console.log('🔄 Starting database restore...\n')

  try {
    // Check if backup file exists
    try {
      await fs.access(backupFile)
    } catch {
      console.error(`❌ Backup file not found: ${backupFile}`)
      process.exit(1)
    }

    // Warning prompt
    console.log('⚠️  WARNING: This will overwrite the current database!')
    console.log(`📍 Backup file: ${backupFile}`)
    console.log(`🗄️  Database: ${DATABASE_URL?.split('@')[1] || 'unknown'}\n`)

    // Confirmation prompt
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await rl.question('Do you want to continue? (yes/no): ')
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Restore cancelled')
      process.exit(0)
    }

    // Decompress if needed
    let fileToRestore = backupFile
    if (backupFile.endsWith('.gz')) {
      console.log('\n🗜️  Decompressing backup...')
      execSync(`gunzip -c ${backupFile} > ${backupFile.replace('.gz', '')}`, {
        stdio: 'inherit',
      })
      fileToRestore = backupFile.replace('.gz', '')
      console.log('✅ Backup decompressed')
    }

    // Run restore
    console.log('\n🔄 Restoring database...')
    execSync(`psql ${DATABASE_URL} < ${fileToRestore}`, {
      stdio: 'inherit',
    })

    console.log('✅ Database restored successfully\n')

    // Cleanup decompressed file if it was created
    if (fileToRestore !== backupFile) {
      await fs.unlink(fileToRestore)
    }

    console.log('🎉 Restore completed successfully!')
  } catch {
    console.error('\n❌ Restore failed:', error)
    process.exit(1)
  }
}

// Get backup file from command line args
const backupFile = process.argv[2]

if (!backupFile) {
  console.error('❌ Please provide a backup file path')
  console.error('Usage: pnpm db:restore <backup-file>')
  process.exit(1)
}

restore(backupFile)
