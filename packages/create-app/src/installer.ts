/**
 * Project installer - Orchestrates project creation
 */

import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import {
  generatePackageJson,
  generateEnvFiles,
  generateDockerFiles,
  generateRoutes,
  generateSDKConfig,
  generateReadme,
  generateSvelteKitConfig,
  generateTailwindConfig,
  generateAppFiles,
  generateHooksServer,
  generateAppDts,
} from './generator.js'

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

export async function createProject(projectPath: string, config: ProjectConfig): Promise<void> {
  // 1. Validate project doesn't exist
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${config.projectName} already exists`)
  }

  // 2. Create project directory
  await fs.ensureDir(projectPath)

  // 3. Generate package.json
  const packageJson = generatePackageJson(config)
  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 })

  // 4. Generate environment files
  const { envFile, envExampleFile } = generateEnvFiles(config)
  await fs.writeFile(path.join(projectPath, '.env'), envFile)
  await fs.writeFile(path.join(projectPath, '.env.example'), envExampleFile)

  // 5. Generate .npmrc for GitHub Packages
  const npmrc = `@big0290:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${config.githubToken}
`
  await fs.writeFile(path.join(projectPath, '.npmrc'), npmrc)

  // 6. Generate .gitignore
  const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.svelte-kit/
build/
dist/

# Environment
.env
.env.local
.env.*.local

# NPM
.npmrc

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Coverage
coverage/
.nyc_output/
`
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)

  // 7. Generate SvelteKit config files
  await fs.writeFile(path.join(projectPath, 'svelte.config.js'), generateSvelteKitConfig())
  await fs.writeFile(path.join(projectPath, 'vite.config.ts'), generateViteConfig())
  await fs.writeFile(path.join(projectPath, 'tsconfig.json'), generateTsConfig())

  // 8. Generate Tailwind & PostCSS config
  await fs.writeFile(path.join(projectPath, 'tailwind.config.ts'), generateTailwindConfig())
  await fs.writeFile(path.join(projectPath, 'postcss.config.js'), generatePostCSSConfig())

  // 9. Generate src directory structure
  await fs.ensureDir(path.join(projectPath, 'src/lib'))
  await fs.ensureDir(path.join(projectPath, 'src/routes'))
  await fs.ensureDir(path.join(projectPath, 'static'))

  // 10. Generate app files
  const appFiles = generateAppFiles()
  await fs.writeFile(path.join(projectPath, 'src/app.html'), appFiles.appHtml)
  await fs.writeFile(path.join(projectPath, 'src/app.css'), appFiles.appCss)
  await fs.writeFile(path.join(projectPath, 'src/app.d.ts'), generateAppDts(config))

  // 11. Generate SDK initialization
  const sdkConfig = generateSDKConfig(config)
  await fs.writeFile(path.join(projectPath, 'src/lib/sdk.ts'), sdkConfig)

  // 12. Generate hooks.server.ts
  await fs.writeFile(path.join(projectPath, 'src/hooks.server.ts'), generateHooksServer(config))

  // 13. Generate routes
  await generateRoutes(projectPath, config)

  // 14. Generate Docker files if needed
  if (config.useDocker) {
    const dockerFiles = generateDockerFiles(config)
    await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerFiles.dockerCompose)

    if (config.database.type === 'docker') {
      await fs.writeFile(path.join(projectPath, 'drizzle.config.ts'), dockerFiles.drizzleConfig)
    }
  }

  // 15. Generate README
  const readme = generateReadme(config)
  await fs.writeFile(path.join(projectPath, 'README.md'), readme)

  // 16. Generate static files
  await fs.writeFile(path.join(projectPath, 'static/robots.txt'), 'User-agent: *\nAllow: /')

  // 17. Install dependencies
  const installSpinner = ora('Installing dependencies...').start()
  try {
    const installCmd =
      config.packageManager === 'pnpm'
        ? 'pnpm install'
        : config.packageManager === 'yarn'
          ? 'yarn install'
          : 'npm install'

    execSync(installCmd, { cwd: projectPath, stdio: 'pipe' })
    installSpinner.succeed('Dependencies installed')
  } catch (error) {
    installSpinner.fail('Failed to install dependencies')
    throw error
  }

  // 18. Initialize git repository
  try {
    execSync('git init', { cwd: projectPath, stdio: 'pipe' })
    execSync('git add .', { cwd: projectPath, stdio: 'pipe' })
    execSync('git commit -m "Initial commit from create-big0290-app"', { cwd: projectPath, stdio: 'pipe' })
  } catch {
    // Git init is optional, don't fail if it doesn't work
    console.log(chalk.yellow('Warning: Failed to initialize git repository'))
  }
}

function generateViteConfig(): string {
  return `import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
  },
})
`
}

function generateTsConfig(): string {
  return `{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
`
}

function generatePostCSSConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}
