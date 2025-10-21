# Publishing to GitHub Packages - Quick Reference

## ✅ Configuration Complete

All 13 packages are configured and ready to publish to GitHub Package Registry at:
`https://github.com/Big0290/sv-sdk/packages`

## GitHub Actions Automatic Publishing

### How It Works

1. **On every push to `main`** → GitHub Actions runs automatically
2. **Build succeeds** → Changesets checks for version changes
3. **If no changesets** → Publishes all unpublished packages
4. **If changesets exist** → Creates PR for version bump
5. **Merge version PR** → Publishes updated packages

### The Workflow Does

✅ Builds all packages  
✅ Authenticates with `GITHUB_TOKEN` (automatic in Actions)  
✅ Publishes to GitHub Package Registry  
✅ Creates git tags  
✅ Handles versioning with changesets

**No manual setup needed!** Just push to main.

## Manual Publishing (Local)

If you want to publish manually from your machine:

### 1. Setup Authentication

```bash
# Set GitHub token (get from https://github.com/settings/tokens)
export GITHUB_TOKEN=ghp_your_token_here

# Create .npmrc
cp .npmrc.example .npmrc
```

### 2. Build and Publish

```bash
# Build all packages
pnpm build

# Publish
pnpm changeset publish

# Push tags
git push --follow-tags
```

## Creating a New Version

### With Changesets (Recommended)

```bash
# 1. Create changeset describing changes
pnpm changeset

# Follow prompts:
# - Select changed packages (space to select, enter to confirm)
# - Choose bump type: patch (0.0.2), minor (0.1.0), major (1.0.0)
# - Write summary

# 2. Commit the changeset
git add .changeset
git commit -m "chore: add changeset"

# 3. Push to main
git push

# GitHub Actions will create a "Version Packages" PR
# Merge that PR to publish the new versions
```

### Manual Version Bump

```bash
# Version all packages
pnpm changeset version

# Commit version changes
git add .
git commit -m "chore: version packages"

# Build and publish
pnpm build
pnpm changeset publish
git push --follow-tags
```

## Installing Published Packages

Users can install your packages with:

```bash
# 1. Configure npm to use GitHub Package Registry for @sv-sdk scope
npm config set @sv-sdk:registry https://npm.pkg.github.com

# 2. Authenticate (for private packages or if needed)
npm login --scope=@sv-sdk --registry=https://npm.pkg.github.com
# Username: your-github-username
# Password: your-github-token (not your password!)

# 3. Install packages
npm install @sv-sdk/core
npm install @sv-sdk/auth
npm install @sv-sdk/ui
# ... etc
```

Or with a project `.npmrc`:

```
@sv-sdk:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Published Packages

| Package                 | Description                  | Installation                  |
| ----------------------- | ---------------------------- | ----------------------------- |
| `@sv-sdk/core`          | SDK initialization & plugins | `npm i @sv-sdk/core`          |
| `@sv-sdk/auth`          | BetterAuth authentication    | `npm i @sv-sdk/auth`          |
| `@sv-sdk/ui`            | Svelte 5 components          | `npm i @sv-sdk/ui`            |
| `@sv-sdk/permissions`   | RBAC system                  | `npm i @sv-sdk/permissions`   |
| `@sv-sdk/email`         | Email with MJML              | `npm i @sv-sdk/email`         |
| `@sv-sdk/audit`         | Audit logging                | `npm i @sv-sdk/audit`         |
| `@sv-sdk/cache`         | Redis & BullMQ               | `npm i @sv-sdk/cache`         |
| `@sv-sdk/security`      | Rate limiting, CSRF          | `npm i @sv-sdk/security`      |
| `@sv-sdk/db-config`     | Drizzle ORM setup            | `npm i @sv-sdk/db-config`     |
| `@sv-sdk/observability` | Health checks                | `npm i @sv-sdk/observability` |
| `@sv-sdk/cli`           | CLI tool                     | `npm i -g @sv-sdk/cli`        |
| `@sv-sdk/validators`    | Zod schemas                  | `npm i @sv-sdk/validators`    |
| `@sv-sdk/shared`        | Shared utilities             | `npm i @sv-sdk/shared`        |

## Troubleshooting

### Authentication Errors in GitHub Actions

The workflow uses `GITHUB_TOKEN` which is automatically provided. If you see auth errors:

1. **Check workflow permissions** - Ensure `packages: write` is set
2. **Verify repository settings** - Go to Settings > Actions > General > Workflow permissions
3. **Enable "Read and write permissions"**

### 401 Unauthorized

If publishing fails with 401:

1. Check the package name matches the GitHub org (`@sv-sdk`)
2. Verify `publishConfig.registry` is set in package.json
3. Ensure `publishConfig.access` is `"public"`

### Package Not Found After Publishing

1. Go to `https://github.com/Big0290/sv-sdk/packages`
2. Find your package
3. Click on it → Package settings → "Change visibility" → Make public
4. GitHub Packages are private by default, even with `access: "public"`

### CLI bin File Not Found

The warning about CLI bin files is expected during first publish. After the first publish, install the package and the bin will work correctly.

## Next Steps

1. **Push to main** → Workflow runs automatically
2. **Check Actions tab** → Monitor the workflow
3. **View packages** → `https://github.com/Big0290/sv-sdk/packages`
4. **Install and test** → Try installing in a new project

## Support

For detailed publishing instructions, see [PUBLISHING.md](./PUBLISHING.md)
