#!/usr/bin/env node
/**
 * create-big0290-app
 * Scaffold SvelteKit applications with the Big0290 SDK
 */

import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'
import { createProject } from './installer.js'
import validateNpmPackageName from 'validate-npm-package-name'

export interface ProjectConfig {
  projectName: string
  features: {
    auth: boolean
    admin: boolean
    email: boolean
    permissions: boolean
    audit: boolean
  }
  database: {
    type: 'docker' | 'local' | 'external'
    url?: string
  }
  redis: {
    type: 'docker' | 'local' | 'external'
    url?: string
  }
  useDocker: boolean
  githubToken: string
  packageManager: 'pnpm' | 'npm' | 'yarn'
}

async function main() {
  const program = new Command()

  program
    .name('create-big0290-app')
    .description('Create a new SvelteKit app with Big0290 SDK')
    .version('0.0.1')
    .argument('[project-name]', 'Name of the project to create')
    .action(async (projectNameArg?: string) => {
      console.log()
      console.log(chalk.bold.cyan('🚀 Create Big0290 App'))
      console.log()

      // Collect project configuration
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: projectNameArg || 'my-app',
          validate: (input: string) => {
            const validation = validateNpmPackageName(input)
            if (!validation.validForNewPackages) {
              return validation.errors?.[0] || 'Invalid project name'
            }
            return true
          },
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Which features do you want to include?',
          choices: [
            { name: 'Authentication (BetterAuth)', value: 'auth', checked: true },
            { name: 'Permissions & RBAC', value: 'permissions', checked: true },
            { name: 'Email System (MJML templates)', value: 'email', checked: false },
            { name: 'Audit Logging', value: 'audit', checked: false },
            { name: 'Admin Dashboard', value: 'admin', checked: false },
          ],
        },
        {
          type: 'list',
          name: 'databaseType',
          message: 'How would you like to setup PostgreSQL?',
          choices: [
            { name: 'Docker (recommended for development)', value: 'docker' },
            { name: 'Local PostgreSQL instance', value: 'local' },
            { name: 'External database (I have my own)', value: 'external' },
          ],
          default: 'docker',
        },
        {
          type: 'input',
          name: 'databaseUrl',
          message: 'PostgreSQL connection URL:',
          when: (answers: Record<string, unknown>) => answers.databaseType === 'external',
          validate: (input: string) => {
            return input.startsWith('postgresql://') || 'Must be a valid PostgreSQL URL'
          },
        },
        {
          type: 'list',
          name: 'redisType',
          message: 'How would you like to setup Redis?',
          choices: [
            { name: 'Docker (recommended for development)', value: 'docker' },
            { name: 'Local Redis instance', value: 'local' },
            { name: 'External Redis (I have my own)', value: 'external' },
          ],
          default: 'docker',
        },
        {
          type: 'input',
          name: 'redisUrl',
          message: 'Redis connection URL:',
          when: (answers: Record<string, unknown>) => answers.redisType === 'external',
          default: 'redis://localhost:6379',
        },
        {
          type: 'confirm',
          name: 'useDocker',
          message: 'Generate Docker Compose configuration?',
          default: true,
          when: (answers: Record<string, unknown>) =>
            answers.databaseType === 'docker' || answers.redisType === 'docker',
        },
        {
          type: 'password',
          name: 'githubToken',
          message: 'GitHub Personal Access Token (for installing @big0290 packages):',
          validate: (input: string) => {
            if (!input || input.length < 10) {
              return 'GitHub token is required to install @big0290 packages'
            }
            return true
          },
        },
        {
          type: 'list',
          name: 'packageManager',
          message: 'Which package manager do you want to use?',
          choices: ['pnpm', 'npm', 'yarn'],
          default: 'pnpm',
        },
      ])

      // Convert features array to object
      const featuresList = answers.features as unknown as string[]
      const config: ProjectConfig = {
        projectName: answers.projectName as string,
        features: {
          auth: featuresList.includes('auth'),
          admin: featuresList.includes('admin'),
          email: featuresList.includes('email'),
          permissions: featuresList.includes('permissions'),
          audit: featuresList.includes('audit'),
        },
        database: {
          type: answers.databaseType as 'docker' | 'local' | 'external',
          url: answers.databaseUrl as string | undefined,
        },
        redis: {
          type: answers.redisType as 'docker' | 'local' | 'external',
          url: answers.redisUrl as string | undefined,
        },
        useDocker: answers.useDocker as boolean,
        githubToken: answers.githubToken as string,
        packageManager: answers.packageManager as ProjectConfig['packageManager'],
      }

      // Create the project
      const spinner = ora('Creating your project...').start()

      try {
        const projectPath = path.join(process.cwd(), config.projectName)
        await createProject(projectPath, config)

        spinner.succeed(chalk.green('Project created successfully!'))

        // Display next steps
        console.log()
        console.log(chalk.bold('Next steps:'))
        console.log()
        console.log(chalk.cyan(`  cd ${config.projectName}`))

        if (config.useDocker) {
          console.log(chalk.cyan('  docker-compose up -d'))
          console.log(chalk.cyan(`  ${config.packageManager} db:migrate`))
        }

        console.log(chalk.cyan(`  ${config.packageManager} dev`))
        console.log()
        console.log(chalk.gray('Your app will be running at http://localhost:5173'))
        console.log()

        if (config.features.auth) {
          console.log(chalk.yellow('📝 Default admin credentials:'))
          console.log(chalk.gray('   Email: admin@example.com'))
          console.log(chalk.gray('   Password: Admin123!'))
          console.log()
        }

        console.log(chalk.bold.green('Happy coding! 🎉'))
        console.log()
      } catch (error) {
        spinner.fail('Failed to create project')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  program.parse()
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})
