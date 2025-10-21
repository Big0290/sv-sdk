/**
 * Project file generator
 * Generates all project files based on user configuration
 */

import fs from 'fs-extra'
import path from 'path'
import type { ProjectConfig } from './installer.js'

export function generatePackageJson(config: ProjectConfig): Record<string, unknown> {
  const { projectName, features, packageManager } = config

  const dependencies: Record<string, string> = {
    '@big0290/core': '^0.0.1',
    '@big0290/shared': '^0.0.1',
    '@sveltejs/kit': '^2.0.0',
    svelte: '^5.15.1',
  }

  const devDependencies: Record<string, string> = {
    '@sveltejs/adapter-auto': '^3.0.0',
    '@sveltejs/vite-plugin-svelte': '^5.0.0',
    '@tailwindcss/forms': '^0.5.7',
    '@types/node': '^20.11.0',
    autoprefixer: '^10.4.20',
    postcss: '^8.4.49',
    tailwindcss: '^3.4.17',
    typescript: '^5.9.3',
    vite: '^6.0.7',
  }

  // Add feature-specific dependencies
  if (features.auth) {
    dependencies['@big0290/auth'] = '^0.0.1'
    dependencies['better-auth'] = '^1.3.3'
  }

  if (features.permissions) {
    dependencies['@big0290/permissions'] = '^0.0.1'
  }

  if (features.email) {
    dependencies['@big0290/email'] = '^0.0.1'
  }

  if (features.audit) {
    dependencies['@big0290/audit'] = '^0.0.1'
  }

  if (features.auth || features.permissions || features.email || features.audit) {
    dependencies['@big0290/db-config'] = '^0.0.1'
    dependencies['drizzle-orm'] = '^0.36.4'
    dependencies['postgres'] = '^3.4.5'
    devDependencies['drizzle-kit'] = '^0.31.5'
  }

  if (features.email || features.permissions) {
    dependencies['@big0290/cache'] = '^0.0.1'
    dependencies['ioredis'] = '^5.4.2'
  }

  dependencies['@big0290/ui'] = '^0.0.1'
  dependencies['@big0290/security'] = '^0.0.1'
  dependencies['@big0290/validators'] = '^0.0.1'

  return {
    name: projectName,
    version: '0.0.1',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite dev',
      build: 'vite build',
      preview: 'vite preview',
      check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
      'check:watch': 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch',
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'drizzle-kit migrate',
      'db:studio': 'drizzle-kit studio',
      lint: 'eslint .',
    },
    dependencies,
    devDependencies,
    packageManager: packageManager === 'pnpm' ? 'pnpm@8.15.0' : undefined,
  }
}

export function generateEnvFiles(config: ProjectConfig): { envFile: string; envExampleFile: string } {
  const { database, redis } = config

  let databaseUrl = ''
  let redisUrl = ''

  if (database.type === 'docker') {
    databaseUrl = 'postgresql://sv_sdk_user:dev_password@localhost:5432/sv_sdk_dev'
  } else if (database.type === 'local') {
    databaseUrl = 'postgresql://localhost:5432/myapp'
  } else {
    databaseUrl = database.url || ''
  }

  if (redis.type === 'docker') {
    redisUrl = 'redis://:dev_redis_password@localhost:6379'
  } else if (redis.type === 'local') {
    redisUrl = 'redis://localhost:6379'
  } else {
    redisUrl = redis.url || 'redis://localhost:6379'
  }

  const envContent = `# Database
DATABASE_URL="${databaseUrl}"

# Redis
REDIS_URL="${redisUrl}"

# App Configuration
NODE_ENV=development
PUBLIC_APP_URL=http://localhost:5173

# Auth (if using authentication)
AUTH_SECRET="${generateRandomSecret()}"
AUTH_URL=http://localhost:5173

# Email (if using email)
EMAIL_FROM=noreply@example.com
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
`

  const envExampleContent = envContent.replace(/=(.*)/g, (match, value) => {
    // Keep boolean and numeric values, clear sensitive ones
    if (value === 'development' || value === 'http://localhost:5173') {
      return match
    }
    return '='
  })

  return {
    envFile: envContent,
    envExampleFile: envExampleContent,
  }
}

export function generateDockerFiles(config: ProjectConfig): {
  dockerCompose: string
  drizzleConfig: string
} {
  const needsPostgres = config.database.type === 'docker'
  const needsRedis = config.redis.type === 'docker'

  const services: string[] = []

  if (needsPostgres) {
    services.push(`  postgres:
    image: postgres:16-alpine
    container_name: ${config.projectName}_postgres
    environment:
      POSTGRES_DB: sv_sdk_dev
      POSTGRES_USER: sv_sdk_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sv_sdk_user -d sv_sdk_dev"]
      interval: 10s
      timeout: 5s
      retries: 5`)
  }

  if (needsRedis) {
    services.push(`  redis:
    image: redis:7-alpine
    container_name: ${config.projectName}_redis
    command: redis-server --requirepass dev_redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5`)
  }

  const volumes: string[] = []
  if (needsPostgres) volumes.push('  postgres_data:')
  if (needsRedis) volumes.push('  redis_data:')

  const dockerCompose = `version: "3.9"

services:
${services.join('\n\n')}

${volumes.length > 0 ? `volumes:\n${volumes.join('\n')}` : ''}
`

  const drizzleConfig = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://sv_sdk_user:dev_password@localhost:5432/sv_sdk_dev',
  },
})
`

  return { dockerCompose, drizzleConfig }
}

export function generateSDKConfig(config: ProjectConfig): string {
  const { features } = config

  const imports: string[] = ["import { createSDK } from '@big0290/core'"]
  const plugins: string[] = []

  if (features.auth) {
    imports.push("import { initializeAuth } from '@big0290/auth'")
    plugins.push('await initializeAuth()')
  }

  if (features.permissions) {
    imports.push("import { initializePermissions } from '@big0290/permissions'")
    plugins.push('await initializePermissions()')
  }

  if (features.email) {
    imports.push("import { initializeEmail } from '@big0290/email'")
    plugins.push('await initializeEmail()')
  }

  if (features.audit) {
    imports.push("import { initializeAudit } from '@big0290/audit'")
    plugins.push('await initializeAudit()')
  }

  return `/**
 * SDK Configuration
 * Initialize Big0290 SDK with selected features
 */

${imports.join('\n')}

export async function initializeSDK() {
  const sdk = createSDK({
    name: '${config.projectName}',
    version: '0.0.1',
  })

${plugins.map((p) => `  ${p}`).join('\n')}

  return sdk
}

// Initialize SDK on server startup
export const sdk = await initializeSDK()
`
}

export function generateReadme(config: ProjectConfig): string {
  const { projectName, features, useDocker, packageManager } = config

  const featuresText = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => `- ${feature.charAt(0).toUpperCase() + feature.slice(1)}`)
    .join('\n')

  return `# ${projectName}

A SvelteKit application built with the Big0290 SDK.

## Features

${featuresText || '- Core SDK'}

## Getting Started

### Prerequisites

- Node.js 18+
- ${packageManager === 'pnpm' ? 'pnpm' : packageManager === 'yarn' ? 'Yarn' : 'npm'}
${useDocker ? '- Docker and Docker Compose' : ''}

### Installation

Dependencies are already installed during project creation.

### Development

${
  useDocker
    ? `1. Start the database and Redis:
\`\`\`bash
docker-compose up -d
\`\`\`

2. Run database migrations:
\`\`\`bash
${packageManager} db:migrate
\`\`\`

3. Start the development server:
`
    : '1. Start the development server:\n'
}
\`\`\`bash
${packageManager} dev
\`\`\`

Your app will be available at http://localhost:5173

${
  features.auth
    ? `### Default Credentials

After running migrations, you can log in with:
- Email: admin@example.com
- Password: Admin123!

`
    : ''
}
## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── lib/
│   │   └── sdk.ts          # SDK initialization
│   ├── routes/             # SvelteKit routes
│   ├── app.css             # Global styles
│   ├── app.d.ts            # TypeScript declarations
│   ├── app.html            # HTML template
│   └── hooks.server.ts     # Server hooks
├── static/                 # Static assets
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── package.json
${useDocker ? '├── docker-compose.yml    # Docker services\n' : ''}└── README.md
\`\`\`

## Available Scripts

- \`${packageManager} dev\` - Start development server
- \`${packageManager} build\` - Build for production
- \`${packageManager} preview\` - Preview production build
- \`${packageManager} check\` - Check TypeScript types
${features.auth || features.permissions ? `- \`${packageManager} db:generate\` - Generate database migrations\n- \`${packageManager} db:migrate\` - Run database migrations\n- \`${packageManager} db:studio\` - Open Drizzle Studio` : ''}

## Documentation

- [Big0290 SDK Documentation](https://github.com/Big0290/sv-sdk)
- [SvelteKit Documentation](https://kit.svelte.dev/)
${features.auth ? '- [BetterAuth Documentation](https://better-auth.com/)\n' : ''}
## License

MIT
`
}

export function generateSvelteKitConfig(): string {
  return `import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },
}

export default config
`
}

export function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#ead5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#A46CF3',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
`
}

export function generateAppFiles(): { appHtml: string; appCss: string } {
  const appHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`

  const appCss = `@import '@big0290/ui/styles';
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

body {
  @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  margin: 0;
  padding: 0;
}
`

  return { appHtml, appCss }
}

export function generateAppDts(config: ProjectConfig): string {
  const hasAuth = config.features.auth

  return `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      ${hasAuth ? 'user: { id: string; email: string; name?: string } | null\n      session: { user: { id: string; email: string; name?: string } } | null' : '// Add your own locals here'}
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
`
}

export function generateHooksServer(config: ProjectConfig): string {
  const { features } = config

  if (!features.auth && !features.permissions) {
    return `import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event)
}
`
  }

  const imports: string[] = ["import type { Handle } from '@sveltejs/kit'"]

  if (features.auth) {
    imports.push("import { auth } from '@big0290/auth'")
  }

  if (features.permissions) {
    imports.push("import { checkRoutePermission } from '@big0290/permissions'")
  }

  if (features.audit) {
    imports.push("import { logAudit } from '@big0290/audit'")
  }

  imports.push("import { rateLimiter } from '@big0290/security'")

  return `/**
 * Server hooks
 * Handles authentication, rate limiting, and permissions
 */

${imports.join('\n')}

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url
  const ipAddress = event.getClientAddress()

${
  features.auth
    ? `  // Get session from BetterAuth
  const session = await auth.api.getSession({ headers: event.request.headers })
  
  // Attach user to event.locals
  event.locals.user = session?.user || null
  event.locals.session = session || null

`
    : ''
}  // Rate limiting on API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = ${features.auth ? 'session?.user?.id || ipAddress' : 'ipAddress'}
    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, {
      max: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimitResult.allowed) {
      return new Response('Too many requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
        },
      })
    }
  }

${
  features.auth
    ? `  // Public routes (no auth required)
  const publicRoutes = ['/login', '/signup', '/api/auth', '/health']
  
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return resolve(event)
  }

  // Require authentication for all other routes
  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(null, {
      status: 302,
      headers: {
        location: \`/login?redirect=\${encodeURIComponent(pathname)}\`,
      },
    })
  }

${
  features.permissions
    ? `  // Check permissions for protected routes
  const routeCheck = await checkRoutePermission(session.user.id, pathname)
  
  if (!routeCheck.allowed) {
    ${features.audit ? "await logAudit('unauthorized_access', { userId: session.user.id, pathname, ipAddress })" : ''}
    
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(null, {
      status: 302,
      headers: { location: '/forbidden' },
    })
  }

`
    : ''
}`
    : ''
}  return resolve(event)
}
`
}

export async function generateRoutes(projectPath: string, config: ProjectConfig): Promise<void> {
  const { features } = config
  const routesDir = path.join(projectPath, 'src/routes')

  // Generate +layout.svelte
  const layout = `<script lang="ts">
  import '../app.css'
  import { theme } from '@big0290/ui'
  
  let { children } = $props()
</script>

<div class="min-h-screen">
  {@render children()}
</div>
`
  await fs.writeFile(path.join(routesDir, '+layout.svelte'), layout)

  // Generate home page
  const homepage = `<script lang="ts">
  import { Button, Card } from '@big0290/ui'
</script>

<div class="container mx-auto px-4 py-16">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
      Welcome to ${config.projectName}
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400">
      Built with Big0290 SDK & SvelteKit
    </p>
  </div>

  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
    <Card>
      <h2 class="text-xl font-semibold mb-2">🎨 Beautiful UI</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Pre-built components with glassmorphism design
      </p>
    </Card>

    ${
      features.auth
        ? `<Card>
      <h2 class="text-xl font-semibold mb-2">🔐 Authentication</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Secure auth with BetterAuth integration
      </p>
    </Card>`
        : ''
    }

    ${
      features.permissions
        ? `<Card>
      <h2 class="text-xl font-semibold mb-2">🛡️ Permissions</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Role-based access control out of the box
      </p>
    </Card>`
        : ''
    }

    ${
      features.email
        ? `<Card>
      <h2 class="text-xl font-semibold mb-2">📧 Email System</h2>
      <p class="text-gray-600 dark:text-gray-400">
        MJML templates and queue processing
      </p>
    </Card>`
        : ''
    }

    ${
      features.audit
        ? `<Card>
      <h2 class="text-xl font-semibold mb-2">📊 Audit Logs</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Complete audit trail for compliance
      </p>
    </Card>`
        : ''
    }
  </div>

  <div class="text-center mt-12">
    <Button variant="primary" size="lg">
      Get Started
    </Button>
  </div>
</div>
`
  await fs.writeFile(path.join(routesDir, '+page.svelte'), homepage)

  // Generate auth routes if enabled
  if (features.auth) {
    await generateAuthRoutes(routesDir)
  }

  // Generate API routes
  await fs.ensureDir(path.join(routesDir, 'api/health'))
  const healthRoute = `import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
`
  await fs.writeFile(path.join(routesDir, 'api/health/+server.ts'), healthRoute)
}

async function generateAuthRoutes(routesDir: string): Promise<void> {
  // Login page
  await fs.ensureDir(path.join(routesDir, 'login'))
  const loginPage = `<script lang="ts">
  import { Button, Input, Card } from '@big0290/ui'
  import { goto } from '$app/navigation'
  
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleLogin() {
    loading = true
    error = ''
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        goto('/dashboard')
      } else {
        const data = await res.json()
        error = data.message || 'Login failed'
      }
    } catch (err) {
      error = 'An error occurred'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center px-4">
  <Card class="w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Sign In</h1>
    
    {#if error}
      <div class="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleLogin() }}>
      <div class="space-y-4">
        <Input
          type="email"
          label="Email"
          bind:value={email}
          required
          placeholder="you@example.com"
        />
        
        <Input
          type="password"
          label="Password"
          bind:value={password}
          required
          placeholder="••••••••"
        />

        <Button type="submit" variant="primary" class="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>

    <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
      Don't have an account? <a href="/signup" class="text-primary-500 hover:underline">Sign up</a>
    </p>
  </Card>
</div>
`
  await fs.writeFile(path.join(routesDir, 'login/+page.svelte'), loginPage)

  // Signup page
  await fs.ensureDir(path.join(routesDir, 'signup'))
  const signupPage = `<script lang="ts">
  import { Button, Input, Card } from '@big0290/ui'
  import { goto } from '$app/navigation'
  
  let email = $state('')
  let password = $state('')
  let name = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleSignup() {
    loading = true
    error = ''
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (res.ok) {
        goto('/login?registered=true')
      } else {
        const data = await res.json()
        error = data.message || 'Signup failed'
      }
    } catch (err) {
      error = 'An error occurred'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center px-4">
  <Card class="w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Create Account</h1>
    
    {#if error}
      <div class="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleSignup() }}>
      <div class="space-y-4">
        <Input
          type="text"
          label="Name"
          bind:value={name}
          required
          placeholder="John Doe"
        />

        <Input
          type="email"
          label="Email"
          bind:value={email}
          required
          placeholder="you@example.com"
        />
        
        <Input
          type="password"
          label="Password"
          bind:value={password}
          required
          placeholder="••••••••"
        />

        <Button type="submit" variant="primary" class="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </div>
    </form>

    <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
      Already have an account? <a href="/login" class="text-primary-500 hover:underline">Sign in</a>
    </p>
  </Card>
</div>
`
  await fs.writeFile(path.join(routesDir, 'signup/+page.svelte'), signupPage)

  // Dashboard page (protected)
  await fs.ensureDir(path.join(routesDir, 'dashboard'))
  const dashboardPage = `<script lang="ts">
  import { Card, Button } from '@big0290/ui'
  import type { PageData } from './$types'
  
  let { data }: { data: PageData } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
  
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card>
      <h2 class="text-xl font-semibold mb-2">Welcome Back!</h2>
      <p class="text-gray-600 dark:text-gray-400">
        You're logged in as {data.user?.email}
      </p>
    </Card>

    <Card>
      <h2 class="text-xl font-semibold mb-2">Quick Stats</h2>
      <p class="text-3xl font-bold text-primary-500">0</p>
      <p class="text-sm text-gray-500">Active sessions</p>
    </Card>

    <Card>
      <h2 class="text-xl font-semibold mb-2">Getting Started</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Start building your application
      </p>
      <Button variant="primary" size="sm">
        View Docs
      </Button>
    </Card>
  </div>
</div>
`
  await fs.writeFile(path.join(routesDir, 'dashboard/+page.svelte'), dashboardPage)

  const dashboardServer = `import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login')
  }

  return {
    user: locals.user,
  }
}
`
  await fs.writeFile(path.join(routesDir, 'dashboard/+page.server.ts'), dashboardServer)
}

function generateRandomSecret(): string {
  return Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')
}
