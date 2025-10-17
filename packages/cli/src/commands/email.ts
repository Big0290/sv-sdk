/**
 * Email commands
 */

import { Command } from 'commander'
import { testTemplate, getEmailStats } from '@sv-sdk/email'
import { db, emailTemplates } from '@sv-sdk/db-config'
import { validateTemplateMJML } from '@sv-sdk/email'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs/promises'

export function createEmailCommand(): Command {
  const email = new Command('email').description('Email management')

  // Send test email
  email
    .command('test')
    .description('Send test email')
    .option('-t, --template <name>', 'Template name')
    .option('-r, --recipient <email>', 'Recipient email')
    .action(async (options) => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'template',
            message: 'Template name:',
            when: !options.template,
          },
          {
            type: 'input',
            name: 'recipient',
            message: 'Recipient email:',
            when: !options.recipient,
            validate: (input) => (input.includes('@') ? true : 'Please enter a valid email'),
          },
        ])

        const templateName = options.template || answers.template
        const recipient = options.recipient || answers.recipient

        // Prompt for variables
        console.log(chalk.blue('\nEnter template variables (press Enter to skip):'))

        const varsInput = await inquirer.prompt([
          {
            type: 'input',
            name: 'variables',
            message: 'Variables (JSON format):',
            default: '{"userName": "Test User"}',
          },
        ])

        const variables = JSON.parse(varsInput.variables)

        const spinner = ora('Sending test email...').start()

        const result = await testTemplate(templateName, recipient, variables)

        if (result.success) {
          spinner.succeed('Test email sent successfully!')
          console.log(`Message ID: ${result.data.messageId}`)
        } else {
          spinner.fail('Failed to send test email')
          console.error(chalk.red(result.error.message))
          process.exit(1)
        }
      } catch (error) {
        console.error(chalk.red('✗ Failed to send test email:'), error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    })

  // List templates
  email
    .command('list-templates')
    .description('List all email templates')
    .action(async () => {
      const spinner = ora('Fetching templates...').start()

      try {
        const templates = await db.select().from(emailTemplates)

        spinner.succeed(`Found ${templates.length} templates`)

        console.log('\n')
        templates.forEach((template) => {
          console.log(chalk.cyan(template.name))
          console.log(`  Subject: ${template.subject}`)
          console.log(`  Locale: ${template.locale}`)
          console.log(`  Version: ${template.version}`)
          console.log(`  Active: ${template.isActive ? chalk.green('Yes') : chalk.red('No')}`)
          console.log(`  Variables: ${template.variables.join(', ')}`)
          console.log()
        })
      } catch (error) {
        spinner.fail('Failed to fetch templates')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Validate template
  email
    .command('validate')
    .description('Validate MJML template')
    .argument('<file>', 'Path to MJML file')
    .action(async (file) => {
      const spinner = ora('Validating template...').start()

      try {
        const mjml = await fs.readFile(file, 'utf-8')

        const validation = validateTemplateMJML(mjml)

        if (validation.valid) {
          spinner.succeed('Template is valid!')
        } else {
          spinner.fail('Template validation failed')

          console.log('\n')
          console.log(chalk.red('Errors:'))
          validation.errors.forEach((error) => {
            console.log(`  - ${error.formattedMessage || error.message}`)
          })
          process.exit(1)
        }
      } catch (error) {
        spinner.fail('Failed to validate template')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  // Email stats
  email
    .command('stats')
    .description('Show email statistics')
    .action(async () => {
      const spinner = ora('Fetching statistics...').start()

      try {
        const stats = await getEmailStats()

        spinner.succeed('Email Statistics')

        console.log('\n')
        console.log(chalk.bold('Total Emails:'), stats.total)
        console.log(chalk.blue('Queued:'), stats.queued)
        console.log(chalk.cyan('Sent:'), stats.sent)
        console.log(chalk.green('Delivered:'), stats.delivered)
        console.log(chalk.red('Bounced:'), stats.bounced)
        console.log(chalk.red('Failed:'), stats.failed)
        console.log(chalk.magenta('Opened:'), stats.opened)
        console.log(chalk.magenta('Clicked:'), stats.clicked)

        console.log('\n')
        console.log(chalk.bold('Rates:'))
        console.log(`  Delivery Rate: ${((stats.delivered / stats.total) * 100).toFixed(2)}%`)
        console.log(`  Open Rate: ${((stats.opened / stats.delivered) * 100).toFixed(2)}%`)
        console.log(`  Click Rate: ${((stats.clicked / stats.delivered) * 100).toFixed(2)}%`)
        console.log(`  Bounce Rate: ${((stats.bounced / stats.total) * 100).toFixed(2)}%`)
      } catch (error) {
        spinner.fail('Failed to fetch statistics')
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
      }
    })

  return email
}

