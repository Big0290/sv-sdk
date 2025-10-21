# Publishing to GitHub Package Registry

This guide explains how to publish the SV-SDK packages to GitHub Package Registry.

## Prerequisites

1. **GitHub Account** with access to the `Big0290/sv-sdk` repository
2. **GitHub Personal Access Token** with package permissions
3. **Authenticated npm** with GitHub Package Registry

## Setup Authentication

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name: `sv-sdk-packages`
4. Select scopes:
   - ✅ `read:packages`
   - ✅ `write:packages`
   - ✅ `delete:packages` (optional)
5. Click "Generate token" and **copy it immediately** (you won't see it again)

### 2. Configure npm

Create a `.npmrc` file in the project root:

```bash
cp .npmrc.example .npmrc
```

Then set your GitHub token as an environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

Or edit `.npmrc` and replace `${GITHUB_TOKEN}` with your actual token (not recommended for security).

### 3. Verify Authentication

```bash
npm whoami --registry=https://npm.pkg.github.com
```

This should display your GitHub username.

## Publishing Packages

### Option 1: Manual Publishing

To publish all packages manually:

```bash
# Build all packages first
pnpm build

# Publish all packages
pnpm changeset publish
```

### Option 2: Version and Publish with Changesets

The recommended way using changesets:

```bash
# 1. Create a changeset (describes what changed)
pnpm changeset

# Follow the prompts:
# - Select packages that changed (space to select, enter to confirm)
# - Choose version bump type (patch/minor/major)
# - Write a summary of changes

# 2. Version packages (updates package.json versions)
pnpm changeset version

# 3. Build and publish
pnpm build
pnpm changeset publish

# 4. Push tags to GitHub
git push --follow-tags
```

### Option 3: CI/CD Publishing (GitHub Actions)

The repository is configured to publish automatically on push to main:

1. **Merge PR or push to main**
2. **GitHub Actions** will automatically:
   - Run tests and build
   - Publish changed packages
   - Create git tags

The `GITHUB_TOKEN` is automatically available in GitHub Actions.

## Published Packages

All packages will be published to:

```
https://github.com/Big0290/sv-sdk/packages
```

And can be installed with:

```bash
# Configure npm to use GitHub Package Registry for @big0290 scope
echo "@big0290:registry=https://npm.pkg.github.com" >> .npmrc

# Install packages
npm install @big0290/core
npm install @big0290/auth
npm install @big0290/ui
# ... etc
```

## Package List

The following packages will be published:

| Package                  | Description                             |
| ------------------------ | --------------------------------------- |
| `@big0290/core`          | Core SDK and plugin system              |
| `@big0290/auth`          | Authentication with BetterAuth          |
| `@big0290/ui`            | Svelte 5 component library              |
| `@big0290/permissions`   | RBAC permissions system                 |
| `@big0290/email`         | Email system with MJML templates        |
| `@big0290/audit`         | Audit logging and compliance            |
| `@big0290/cache`         | Redis caching and BullMQ queues         |
| `@big0290/security`      | Rate limiting, CSRF, security headers   |
| `@big0290/db-config`     | Database configuration with Drizzle ORM |
| `@big0290/observability` | Health checks and monitoring            |
| `@big0290/cli`           | Command-line interface                  |
| `@big0290/validators`    | Validation schemas and DTOs             |
| `@big0290/shared`        | Shared utilities and types              |

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Troubleshooting

### Authentication Errors

If you see `ENEEDAUTH` or `401 Unauthorized`:

1. Verify your token has package permissions
2. Check `.npmrc` is configured correctly
3. Ensure `GITHUB_TOKEN` environment variable is set
4. Try: `npm login --scope=@big0290 --registry=https://npm.pkg.github.com`

### Package Not Found

If published packages can't be installed:

1. Ensure the package is set to **public** in GitHub
2. Configure `.npmrc` with `@big0290:registry=https://npm.pkg.github.com`
3. Check package visibility at `https://github.com/Big0290/sv-sdk/packages`

### CLI bin File Not Found

The CLI package builds to `dist/index.js`. Ensure:

1. `pnpm build` was run in the CLI package
2. The `dist` folder exists
3. `dist/index.js` has the shebang `#!/usr/bin/env node`

## Security Notes

- ⚠️ **Never commit `.npmrc` with tokens** - it's in `.gitignore`
- ⚠️ **Use environment variables** for tokens, not hardcoded values
- ⚠️ **Rotate tokens regularly** for security
- ✅ **GitHub Actions** automatically gets `GITHUB_TOKEN` - no manual setup needed
