/**
 * Auth commands
 */

import { Command } from 'commander'
import { getUsers, createUser, deleteUser, getUserByEmail } from '@sv-sdk/auth'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'

export function createAuthCommand(): Command {
  const auth = new Command('auth').description('User authentication management')

  // List users
  auth
    .command('list')
    .description('List all users')
    .option('-r, --role <role>', 'Filter by role')
    .option('-l, --limit <number>', 'Limit results', '20')
    .action(async (options) => {
      const spinner = ora('Fetching users...').start()

      try {
        const result = await getUsers(
          { role: options.role },
          { page: 1, pageSize: parseInt(options.limit) }
        )

        spinner.succeed(`Found ${result.pagination.totalCount} users`)

        console.log('\n')
        result.data.forEach((user) => {
          console.log(chalk.cyan(user.email))
          console.log(`  ID: ${user.id}`)
          console.log(`  Name: ${user.name || 'N/A'}`)
          console.log(`  Role: ${chalk.yellow(user.role)}`)
          console.log(`  Active: ${user.isActive ? chalk.green('Yes') : chalk.red('No')}`)
          console.log(`  Verified: ${user.emailVerified ? chalk.green('Yes') : chalk.yellow('No')}`)
          console.log()
        })
      } catch (error) {
        spinner.fail('Failed to fetch users')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Create user
  auth
    .command('create')
    .description('Create a new user')
    .option('-e, --email <email>', 'User email')
    .option('-n, --name <name>', 'User name')
    .option('-r, --role <role>', 'User role', 'user')
    .action(async (options) => {
      try {
        // Prompt for missing options
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'Email address:',
            when: !options.email,
            validate: (input) => (input.includes('@') ? true : 'Please enter a valid email'),
          },
          {
            type: 'input',
            name: 'name',
            message: 'Full name:',
            when: !options.name,
          },
        ])

        const email = options.email || answers.email
        const name = options.name || answers.name
        const role = options.role

        const spinner = ora('Creating user...').start()

        const user = await createUser({
          email,
          name,
          role,
          emailVerified: false,
          isActive: true,
        })

        spinner.succeed('User created successfully!')

        console.log('\n')
        console.log(chalk.green('✓ User Details:'))
        console.log(`  Email: ${chalk.cyan(user.email)}`)
        console.log(`  ID: ${user.id}`)
        console.log(`  Role: ${chalk.yellow(user.role)}`)
        console.log()
        console.log(chalk.yellow('⚠ Note: Set password via BetterAuth or admin panel'))
      } catch (error) {
        console.error(chalk.red('✗ Failed to create user:'), error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // Delete user
  auth
    .command('delete')
    .description('Delete a user')
    .option('-e, --email <email>', 'User email')
    .option('-f, --force', 'Skip confirmation', false)
    .action(async (options) => {
      try {
        let email = options.email

        if (!email) {
          const answer = await inquirer.prompt([
            {
              type: 'input',
              name: 'email',
              message: 'Email address to delete:',
              validate: (input) => (input.includes('@') ? true : 'Please enter a valid email'),
            },
          ])
          email = answer.email
        }

        // Get user first
        const user = await getUserByEmail(email)

        if (!user) {
          console.log(chalk.yellow(`User not found: ${email}`))
          process.exit(1)
        }

        // Confirm deletion
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Delete user ${chalk.cyan(email)}? This will soft-delete the user.`,
              default: false,
            },
          ])

          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled'))
            process.exit(0)
          }
        }

        const spinner = ora('Deleting user...').start()

        await deleteUser(user.id)

        spinner.succeed('User deleted successfully')
      } catch (error) {
        console.error(chalk.red('✗ Failed to delete user:'), error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  return auth
}

