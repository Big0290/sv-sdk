/**
 * Development commands
 */

import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { execSync } from 'child_process'

export function createDevCommand(): Command {
  const dev = new Command('dev').description('Development utilities')

  // Setup command
  dev
    .command('setup')
    .description('Setup development environment')
    .action(async () => {
      const spinner = ora('Setting up development environment...').start()

      try {
        // Run dev setup script
        execSync('bash ./scripts/dev-setup.sh', { stdio: 'inherit' })
        spinner.succeed('Development environment ready!')
      } catch (error) {
        spinner.fail('Setup failed')
        process.exit(1)
      }
    })

  // Reset command
  dev
    .command('reset')
    .description('Reset development environment')
    .option('--no-confirm', 'Skip confirmation')
    .action(async (options) => {
      if (options.confirm) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow('This will delete all data and reset the database. Continue?'),
            default: false,
          },
        ])

        if (!confirm) {
          console.log(chalk.yellow('Reset cancelled'))
          process.exit(0)
        }
      }

      const spinner = ora('Resetting environment...').start()

      try {
        // Stop services
        execSync('docker-compose down -v', { stdio: 'inherit' })

        // Remove database volumes
        spinner.text = 'Removing volumes...'

        // Restart services
        spinner.text = 'Starting services...'
        execSync('docker-compose up -d', { stdio: 'inherit' })

        // Wait for services to be ready
        spinner.text = 'Waiting for services...'
        execSync('sleep 5')

        // Run migrations
        spinner.text = 'Running migrations...'
        execSync('pnpm db:migrate', { stdio: 'inherit' })

        // Seed database
        spinner.text = 'Seeding database...'
        execSync('pnpm db:seed', { stdio: 'inherit' })

        spinner.succeed('Environment reset complete!')
      } catch (error) {
        spinner.fail('Reset failed')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  return dev
}

