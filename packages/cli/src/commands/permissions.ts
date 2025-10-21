/**
 * Permission commands
 */

import { Command } from 'commander'
import { getRoles, assignRole, can } from '@big0290/permissions'
import { getUserByEmail } from '@big0290/auth'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'

export function createPermissionsCommand(): Command {
  const permissions = new Command('permissions').description('Permission and role management')

  // List roles
  permissions
    .command('list')
    .description('List all roles')
    .action(async () => {
      const spinner = ora('Fetching roles...').start()

      try {
        const roles = await getRoles()

        spinner.succeed(`Found ${roles.length} roles`)

        console.log('\n')
        roles.forEach((role) => {
          console.log(chalk.cyan(role.name))
          console.log(`  ID: ${role.id}`)
          console.log(`  Description: ${role.description || 'N/A'}`)
          console.log(`  System: ${role.isSystem ? 'Yes' : 'No'}`)
          console.log(`  Permissions: ${role.permissions.length}`)
          console.log()
        })
      } catch (error) {
        spinner.fail('Failed to fetch roles')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Assign role
  permissions
    .command('assign')
    .description('Assign role to user')
    .option('-e, --email <email>', 'User email')
    .option('-r, --role <role>', 'Role name')
    .action(async (options) => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'User email:',
            when: !options.email,
          },
          {
            type: 'input',
            name: 'role',
            message: 'Role name:',
            when: !options.role,
          },
        ])

        const email = options.email || answers.email
        const roleName = options.role || answers.role

        const spinner = ora('Assigning role...').start()

        // Get user
        const user = await getUserByEmail(email)
        if (!user) {
          spinner.fail('User not found')
          process.exit(1)
        }

        // Get role
        const roles = await getRoles()
        const role = roles.find((r) => r.name === roleName)

        if (!role) {
          spinner.fail('Role not found')
          process.exit(1)
        }

        await assignRole(user.id, role.id)

        spinner.succeed('Role assigned successfully!')
      } catch (error) {
        console.error(chalk.red('✗ Failed to assign role:'), error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // Check permission
  permissions
    .command('check')
    .description('Check if user has permission')
    .option('-e, --email <email>', 'User email')
    .option('-p, --permission <permission>', 'Permission string (e.g., read:any:user)')
    .action(async (options) => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'User email:',
            when: !options.email,
          },
          {
            type: 'input',
            name: 'permission',
            message: 'Permission (e.g., read:any:user):',
            when: !options.permission,
          },
        ])

        const email = options.email || answers.email
        const permission = options.permission || answers.permission

        const spinner = ora('Checking permission...').start()

        // Get user
        const user = await getUserByEmail(email)
        if (!user) {
          spinner.fail('User not found')
          process.exit(1)
        }

        const allowed = await can(user.id, permission)

        spinner.stop()

        console.log()
        console.log(`User: ${chalk.cyan(email)}`)
        console.log(`Permission: ${chalk.yellow(permission)}`)
        console.log(`Result: ${allowed ? chalk.green('✓ GRANTED') : chalk.red('✗ DENIED')}`)
      } catch (error) {
        console.error(chalk.red('✗ Permission check failed:'), error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  return permissions
}
