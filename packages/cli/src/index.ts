#!/usr/bin/env node
/**
 * SV-SDK CLI Entry Point
 */

/**
 * SV-SDK CLI
 * Command-line interface for managing the SV-SDK platform
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { createAuthCommand } from './commands/auth.js'
import { createAuditCommand } from './commands/audit.js'
import { createEmailCommand } from './commands/email.js'
import { createPermissionsCommand } from './commands/permissions.js'
import { createDbCommand } from './commands/db.js'
import { createHealthCommand } from './commands/health.js'
import { createDevCommand } from './commands/dev.js'

// Load environment variables
import 'dotenv/config'

const program = new Command()

program
  .name('sdk')
  .description('SV-SDK Command Line Interface')
  .version('0.0.1')
  .option('-v, --verbose', 'Enable verbose logging')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}
  $ sdk auth list --role admin
  $ sdk email test --template verification_email --recipient test@example.com
  $ sdk audit export --from 2024-01-01 --to 2024-01-31 --format csv
  $ sdk permissions check --email user@example.com --permission read:any:user
  $ sdk db migrate
  $ sdk health

${chalk.bold('Documentation:')}
  https://github.com/your-org/sv-sdk
`
  )

// Add commands
program.addCommand(createAuthCommand())
program.addCommand(createAuditCommand())
program.addCommand(createEmailCommand())
program.addCommand(createPermissionsCommand())
program.addCommand(createDbCommand())
program.addCommand(createHealthCommand())
program.addCommand(createDevCommand())

// Parse arguments
program.parse()
