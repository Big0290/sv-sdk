/**
 * Audit commands
 */

import { Command } from 'commander'
import { fetchAuditLogs, exportAuditLogsJSON, exportAuditLogsCSV, applyRetentionPolicy } from '@big0290/audit'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs/promises'

export function createAuditCommand(): Command {
  const audit = new Command('audit').description('Audit log management')

  // Export logs
  audit
    .command('export')
    .description('Export audit logs')
    .option('--from <date>', 'Start date (ISO format)')
    .option('--to <date>', 'End date (ISO format)')
    .option('-f, --format <format>', 'Export format (json|csv)', 'json')
    .option('-o, --output <file>', 'Output file path')
    .action(async (options) => {
      const spinner = ora('Exporting audit logs...').start()

      try {
        const filters: Record<string, Date | string | undefined> = {}

        if (options.from) {
          filters.dateFrom = new Date(options.from)
        }

        if (options.to) {
          filters.dateTo = new Date(options.to)
        }

        let content: string

        if (options.format === 'csv') {
          content = await exportAuditLogsCSV(filters)
        } else {
          content = await exportAuditLogsJSON(filters)
        }

        const outputPath = options.output || `audit-logs-${Date.now()}.${options.format}`

        await fs.writeFile(outputPath, content)

        spinner.succeed('Audit logs exported!')

        console.log()
        console.log(chalk.green('✓ Export complete'))
        console.log(`  File: ${chalk.cyan(outputPath)}`)
        console.log(`  Format: ${options.format}`)
      } catch (error) {
        spinner.fail('Export failed')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Search logs
  audit
    .command('search')
    .description('Search audit logs')
    .option('-e, --event <type>', 'Event type')
    .option('-u, --user <userId>', 'User ID')
    .option('-l, --limit <number>', 'Limit results', '20')
    .action(async (options) => {
      const spinner = ora('Searching audit logs...').start()

      try {
        const result = await fetchAuditLogs(
          {
            eventType: options.event,
            userId: options.user,
          },
          { page: 1, pageSize: parseInt(options.limit) }
        )

        spinner.succeed(`Found ${result.pagination.totalCount} logs`)

        console.log('\n')
        result.data.forEach((log) => {
          console.log(chalk.blue(log.eventType))
          console.log(`  ID: ${log.id}`)
          console.log(`  User: ${log.userId || 'N/A'}`)
          console.log(`  IP: ${log.ipAddress || 'N/A'}`)
          console.log(`  Time: ${log.createdAt.toISOString()}`)
          console.log(`  PII Masked: ${log.piiMasked ? 'Yes' : 'No'}`)
          console.log()
        })
      } catch (error) {
        spinner.fail('Search failed')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Apply retention policy
  audit
    .command('retention')
    .description('Apply retention policy')
    .option('-d, --days <number>', 'Retention days', '365')
    .option('--no-archive', 'Skip archiving before deletion')
    .action(async (options) => {
      const spinner = ora('Applying retention policy...').start()

      try {
        const result = await applyRetentionPolicy({
          retentionDays: parseInt(options.days),
          archiveBeforeDelete: options.archive !== false,
        })

        spinner.succeed('Retention policy applied!')

        console.log()
        console.log(chalk.green('✓ Cleanup complete'))
        console.log(`  Deleted: ${result.deleted} logs`)
        console.log(`  Archived: ${result.archived ? 'Yes' : 'No'}`)
        if (result.archivePath) {
          console.log(`  Archive: ${chalk.cyan(result.archivePath)}`)
        }
      } catch (error) {
        spinner.fail('Retention policy failed')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  return audit
}
