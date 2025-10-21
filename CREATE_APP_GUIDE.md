# Create App Scaffolder - Complete Guide

## Overview

You now have a `create-big0290-app` package that works like `create-svelte` or `create-next-app`. Users can scaffold fully-configured SvelteKit projects with your SDK in seconds!

## How It Works

### For End Users (After Publishing)

```bash
# Using pnpm (recommended)
pnpm create @big0290/app my-awesome-app

# Using npm
npm create @big0290/app my-awesome-app

# Using yarn
yarn create @big0290/app my-awesome-app
```

The command will:

1. Download the `create-big0290-app` package from GitHub Packages
2. Run the interactive CLI
3. Prompt for project configuration (7 questions)
4. Generate a complete SvelteKit project
5. Install all dependencies
6. Initialize git repository
7. Display next steps

### Interactive Prompts

Users will be asked:

1. **Project name** - Validates npm package name format
2. **Features to include** - Checkbox selection:
   - ✓ Authentication (BetterAuth) - default selected
   - ✓ Permissions & RBAC - default selected
   - Email System (MJML templates)
   - Audit Logging
   - Admin Dashboard
3. **PostgreSQL setup** - Docker / Local / External
4. **External database URL** - (only if external selected)
5. **Redis setup** - Docker / Local / External
6. **External Redis URL** - (only if external selected)
7. **Docker Compose** - Yes/No (auto-shown if Docker selected)
8. **GitHub Token** - Required to install @big0290 packages
9. **Package Manager** - pnpm / npm / yarn

## Generated Project Structure

```
my-awesome-app/
├── src/
│   ├── lib/
│   │   └── sdk.ts              # SDK initialization with selected features
│   ├── routes/
│   │   ├── +layout.svelte      # Root layout with theme
│   │   ├── +page.svelte        # Landing page with features showcase
│   │   ├── login/              # Auth: Login page
│   │   │   └── +page.svelte
│   │   ├── signup/             # Auth: Signup page
│   │   │   └── +page.svelte
│   │   ├── dashboard/          # Protected dashboard
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   └── api/
│   │       └── health/
│   │           └── +server.ts  # Health check endpoint
│   ├── app.css                 # Global styles with Tailwind & SDK theme
│   ├── app.d.ts                # TypeScript declarations (session types)
│   ├── app.html                # HTML template
│   └── hooks.server.ts         # Server hooks (auth, rate limiting, permissions)
├── static/
│   └── robots.txt
├── .env                        # Environment variables (pre-filled for Docker)
├── .env.example                # Example environment variables
├── .gitignore                  # Comprehensive ignores
├── .npmrc                      # GitHub Packages config with user's token
├── docker-compose.yml          # PostgreSQL + Redis (if Docker selected)
├── drizzle.config.ts           # Drizzle ORM config (if database enabled)
├── package.json                # SvelteKit + selected @big0290 packages
├── postcss.config.js           # PostCSS with Tailwind
├── README.md                   # Custom README with getting started guide
├── svelte.config.js            # SvelteKit configuration
├── tailwind.config.ts          # Tailwind with SDK theme colors
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## What Gets Configured Automatically

### 1. Package Dependencies

Based on selected features, the generated `package.json` includes:

**Always included:**

- `@big0290/core` - Core SDK
- `@big0290/shared` - Utilities
- `@big0290/ui` - UI components
- `@big0290/security` - Rate limiting
- `@big0290/validators` - Validation schemas
- `@sveltejs/kit` - SvelteKit
- `svelte` - Svelte 5
- `tailwindcss` - Styling

**Conditional (based on features):**

- If Auth: `@big0290/auth`, `better-auth`
- If Permissions: `@big0290/permissions`
- If Email: `@big0290/email`
- If Audit: `@big0290/audit`
- If any DB feature: `@big0290/db-config`, `drizzle-orm`, `postgres`
- If cache needed: `@big0290/cache`, `ioredis`

### 2. Environment Variables

Auto-generated `.env` with:

- `DATABASE_URL` - Pre-filled for Docker or placeholder for external
- `REDIS_URL` - Pre-filled for Docker or placeholder for external
- `AUTH_SECRET` - Randomly generated secure secret
- `AUTH_URL` - Set to localhost:5173
- `NODE_ENV` - development
- `PUBLIC_APP_URL` - http://localhost:5173
- Email configuration placeholders

### 3. SDK Initialization (`src/lib/sdk.ts`)

Automatically imports and initializes only the selected features:

```typescript
// Example for auth + permissions
import { createSDK } from '@big0290/core'
import { initializeAuth } from '@big0290/auth'
import { initializePermissions } from '@big0290/permissions'

export async function initializeSDK() {
  const sdk = createSDK({
    name: 'my-awesome-app',
    version: '0.0.1',
  })

  await initializeAuth()
  await initializePermissions()

  return sdk
}

export const sdk = await initializeSDK()
```

### 4. Server Hooks (`src/hooks.server.ts`)

Implements:

- Session management (if auth enabled)
- Rate limiting on API routes
- Permission checking for protected routes (if permissions enabled)
- Audit logging for unauthorized access (if audit enabled)
- Redirect to login for unauthenticated users

### 5. Authentication Routes

If auth is selected, generates:

- `/login` - Login page with form using SDK components
- `/signup` - Signup page with form using SDK components
- `/dashboard` - Protected dashboard page (requires auth)

### 6. Docker Compose

If Docker is selected, generates `docker-compose.yml` with:

- PostgreSQL 16 Alpine (if database: docker)
- Redis 7 Alpine (if redis: docker)
- Health checks configured
- Persistent volumes
- Pre-configured passwords (dev_password, dev_redis_password)

## Testing Locally (Before Publishing)

### Option 1: Using pnpm link

```bash
# From the sv-sdk repository root
cd packages/create-app
pnpm build
pnpm link --global

# Now test it
cd /tmp
create-big0290-app test-project
```

### Option 2: Using direct node execution

```bash
# From the sv-sdk repository root
cd packages/create-app
pnpm build

# Test it
cd /tmp
node /path/to/sv-sdk/packages/create-app/dist/index.js test-project
```

### Option 3: Using the root script

```bash
# From the sv-sdk repository root
pnpm create:build
pnpm create:link

# Now test
cd /tmp
create-big0290-app test-project
```

## After Publishing

Once you run `pnpm changeset publish` and the package is on GitHub Packages, users can run:

```bash
pnpm create @big0290/app my-project
```

## Features of the Generated Project

### Immediate Development

```bash
cd my-awesome-app

# If Docker was selected
docker-compose up -d
pnpm db:migrate

# Start development
pnpm dev
```

App runs at http://localhost:5173

### If Authentication Was Selected

Default credentials after running migrations:

- Email: admin@example.com
- Password: Admin123!

### Available Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - TypeScript type checking
- `pnpm db:generate` - Generate new migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

## GitHub Token Security

The scaffolder asks for a GitHub token to install @big0290 packages. This token:

- Is only used during `pnpm install`
- Is written to `.npmrc` which is automatically added to `.gitignore`
- Is never committed to git
- Needs only `read:packages` permission

Users get a token at: https://github.com/settings/tokens

## Architecture Decisions

### Why Standalone Package?

The `create-big0290-app` package is separate from `@big0290/cli` because:

- Follows npm conventions (`create-*` packages)
- Can be run without installing the CLI first
- Lighter weight (no SDK dependencies in create package)
- Better for new users (just `npm create @big0290/app`)

### Why TypeScript Source in Packages?

The generated project installs @big0290 packages as source TypeScript:

- Better tree-shaking
- Faster HMR in development
- IDE can jump to source
- SvelteKit/Vite handles compilation automatically

### Why Full Setup?

The "batteries-included" approach means:

- New users get a working app immediately
- All best practices configured
- Example code shows SDK usage patterns
- Production-ready from day one

## Next Steps

### Before First Use

1. **Build the package:**

   ```bash
   pnpm create:build
   ```

2. **Test it locally:**

   ```bash
   pnpm create:link
   cd /tmp
   create-big0290-app test-app
   ```

3. **Verify the generated project works:**
   ```bash
   cd test-app
   docker-compose up -d
   pnpm db:migrate
   pnpm dev
   ```

### To Publish

The package will be published automatically with other packages when you:

```bash
pnpm changeset
# Select "create-big0290-app" as changed package
# Choose version bump (likely minor for new feature)
# Commit and push

# Or manually publish
pnpm build
pnpm changeset publish
```

## Troubleshooting

### "Cannot find module" errors during generation

The create-app package must be built before use:

```bash
pnpm create:build
```

### "Command not found: create-big0290-app"

Link the package globally:

```bash
pnpm create:link
```

### Generated project has dependency errors

Make sure:

1. All @big0290 packages are published to GitHub Packages
2. User provided a valid GitHub token
3. Token has `read:packages` permission

## Files Created

- `packages/create-app/package.json` - Package configuration with bin
- `packages/create-app/src/index.ts` - CLI entry with interactive prompts
- `packages/create-app/src/installer.ts` - Project creation orchestration
- `packages/create-app/src/generator.ts` - File generation functions
- `packages/create-app/README.md` - Usage documentation
- `packages/create-app/tsconfig.json` - TypeScript build config (noEmit: false)

## Summary

You now have a professional scaffolder that:
✅ Works with `npm create @big0290/app` syntax
✅ Prompts for configuration interactively
✅ Generates complete, working SvelteKit projects
✅ Includes Docker setup for databases
✅ Pre-configures all SDK features
✅ Creates example routes and components
✅ Installs dependencies automatically
✅ Initializes git repository
✅ Provides clear next steps

Users can go from zero to a working app with your SDK in under 3 minutes! 🚀
