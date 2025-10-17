/**
 * Health check command
 */

import { Command } from 'commander'
import { checkSystemHealth } from '@sv-sdk/core'
import chalk from 'chalk'
import ora from 'ora'

export function createHealthCommand(): Command {
  const health = new Command('health').description('Check system health').action(async () => {
    const spinner = ora('Checking system health...').start()

    try {
      const health = await checkSystemHealth()

      if (!health.healthy) {
        spinner.fail('System is unhealthy')

        console.log()
        console.log(chalk.red('✗ System Status:'), 'UNHEALTHY')
        console.log()

        // Show service statuses
        for (const [service, status] of Object.entries(health.services)) {
          const icon = status.healthy ? chalk.green('✓') : chalk.red('✗')
          console.log(`${icon} ${service}:`, status.healthy ? 'OK' : 'FAILED')

          if (status.latency) {
            console.log(`  Latency: ${status.latency}ms`)
          }

          if (status.error) {
            console.log(chalk.red(`  Error: ${status.error}`))
          }
        }

        process.exit(1)
      }

      spinner.succeed('System is healthy')

      console.log()
      console.log(chalk.green('✓ System Status:'), 'HEALTHY')
      console.log()

      for (const [service, status] of Object.entries(health.services)) {
        console.log(chalk.green('✓'), `${service}:`, 'OK')

        if (status.latency) {
          console.log(`  Latency: ${chalk.cyan(status.latency + 'ms')}`)
        }

        if (status.details) {
          Object.entries(status.details).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              console.log(`  ${key}: ${value.join(', ')}`)
            } else {
              console.log(`  ${key}: ${JSON.stringify(value)}`)
            }
          })
        }
      }

      console.log()
      console.log(chalk.gray('Timestamp:'), health.timestamp)
    } catch (error) {
      spinner.fail('Health check failed')
      console.error(chalk.red(error instanceof Error ? error.message : String(error)))
      process.exit(1)
    }
  })

  return health
}

