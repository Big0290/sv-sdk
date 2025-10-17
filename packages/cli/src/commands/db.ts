/**
 * Database commands
 */

import { Command } from 'commander'
import { checkConnection, checkSchemas } from '@sv-sdk/db-config'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'

export function createDbCommand(): Command {
  const db = new Command('db').description('Database management')

  // Migrate
  db.command('migrate')
    .description('Run database migrations')
    .action(async () => {
      const spinner = ora('Running migrations...').start()

      try {
        execSync('pnpm --filter @sv-sdk/db-config db:migrate', { stdio: 'inherit' })
        spinner.succeed('Migrations completed!')
      } catch (error) {
        spinner.fail('Migration failed')
        process.exit(1)
      }
    })

  // Seed
  db.command('seed')
    .description('Seed database with initial data')
    .action(async () => {
      const spinner = ora('Seeding database...').start()

      try {
        execSync('pnpm --filter @sv-sdk/db-config db:seed', { stdio: 'inherit' })
        spinner.succeed('Database seeded!')
      } catch (error) {
        spinner.fail('Seeding failed')
        process.exit(1)
      }
    })

  // Status
  db.command('status')
    .description('Check database status')
    .action(async () => {
      const spinner = ora('Checking database...').start()

      try {
        const health = await checkConnection()

        if (!health.healthy) {
          spinner.fail('Database connection failed')
          console.error(chalk.red(health.error))
          process.exit(1)
        }

        const schemas = await checkSchemas()

        spinner.succeed('Database is healthy')

        console.log()
        console.log(chalk.green('✓ Connection:'), 'OK')
        console.log(chalk.green('✓ Latency:'), `${health.latency}ms`)
        console.log(chalk.green('✓ Schemas:'), schemas.schemas.join(', '))

        if (schemas.missing.length > 0) {
          console.log(chalk.yellow('⚠ Missing schemas:'), schemas.missing.join(', '))
        }
      } catch (error) {
        spinner.fail('Health check failed')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Backup
  db.command('backup')
    .description('Create database backup')
    .option('-o, --output <path>', 'Output directory', './backups')
    .action(async (options) => {
      const spinner = ora('Creating backup...').start()

      try {
        process.env.BACKUP_DIR = options.output
        execSync('tsx packages/db-config/scripts/backup.ts', { stdio: 'inherit' })
        spinner.succeed('Backup created!')
      } catch (error) {
        spinner.fail('Backup failed')
        process.exit(1)
      }
    })

  return db
}

