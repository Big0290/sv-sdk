# GitHub Packages Publishing - Issues Fixed

## Problem Summary

Your GitHub Actions workflows were failing with the error:

```
The process '/home/runner/setup-pnpm/node_modules/.bin/pnpm' failed with exit code 1
```

## Root Causes Identified

### Issue 1: Missing `files` Field in package.json ✅ FIXED

**Problem:** All packages pointed to TypeScript source files (`./src/index.ts`) in their `main`, `types`, and `exports` fields, but didn't include the `"files"` field. When publishing, npm only includes certain files by default (README, package.json, etc.) - without the `"files"` field, the `src` directory wasn't being published.

**Solution:** Added `"files": ["src"]` to all 11 packages:

- @sv-sdk/auth
- @sv-sdk/audit
- @sv-sdk/cache
- @sv-sdk/core
- @sv-sdk/db-config
- @sv-sdk/email
- @sv-sdk/observability
- @sv-sdk/permissions
- @sv-sdk/security
- @sv-sdk/shared
- @sv-sdk/validators

_Note: @sv-sdk/cli and @sv-sdk/ui already had this configured correctly._

### Issue 2: Duplicate Publishing Workflows ✅ FIXED

**Problem:** Two workflows were both trying to publish on push to `main`:

- `publish.yml` - Configured for GitHub Packages (correct)
- `release.yml` - Configured for npm registry with missing `NPM_TOKEN` (wrong)

This caused conflicts and the release.yml workflow failed because:

1. It expected an `NPM_TOKEN` secret that doesn't exist
2. It wasn't configured to use GitHub Packages registry
3. Both workflows were trying to run changesets simultaneously

**Solution:** Deleted `.github/workflows/release.yml` since `publish.yml` already handles GitHub Packages publishing correctly.

## Current Workflow

After these fixes, here's how publishing works:

1. **On push to `main`** → `.github/workflows/publish.yml` triggers automatically
2. **Builds all packages** → Runs `pnpm build`
3. **Authenticates with GitHub** → Uses `GITHUB_TOKEN` (automatic in Actions)
4. **Checks for changesets:**
   - If changesets exist → Creates a "Version Packages" PR
   - If no changesets → Publishes any unpublished packages
5. **Publishes to GitHub Packages** → At `https://github.com/Big0290/sv-sdk/packages`

## How to Publish New Versions

### Option 1: Using Changesets (Recommended)

```bash
# 1. Create a changeset
pnpm changeset
# - Select packages that changed
# - Choose bump type (patch/minor/major)
# - Write summary

# 2. Commit and push
git add .changeset
git commit -m "chore: add changeset"
git push

# 3. GitHub Actions will create a "Version Packages" PR
# 4. Merge the PR to publish new versions
```

### Option 2: Manual Publish (Local)

```bash
# 1. Build packages
pnpm build

# 2. Set GitHub token
export GITHUB_TOKEN=your_token_here

# 3. Publish
pnpm changeset publish

# 4. Push tags
git push --follow-tags
```

## Files Modified

- ✅ `packages/*/package.json` - Added `"files": ["src"]` to 11 packages
- ✅ `.github/workflows/release.yml` - Deleted (duplicate workflow)

## Next Steps

1. **Commit the workflow deletion:**

   ```bash
   git commit -m "fix: remove duplicate release workflow"
   git push
   ```

2. **Monitor the publish workflow:**
   - Go to: https://github.com/Big0290/sv-sdk/actions
   - Check that the "Publish Packages" workflow succeeds

3. **Verify packages are published:**
   - Visit: https://github.com/Big0290/sv-sdk/packages
   - All 13 packages should be listed

4. **Test installation:**

   ```bash
   # Configure npm
   echo "@sv-sdk:registry=https://npm.pkg.github.com" >> .npmrc

   # Install a package
   npm install @sv-sdk/core
   ```

## Remaining Workflows

Your repository now has these workflows:

- ✅ `ci.yml` - Runs tests, linting, builds on PRs
- ✅ `publish.yml` - Publishes to GitHub Packages on main push
- ✅ `performance.yml` - Runs performance benchmarks
- ✅ `security-scan.yml` - Security scanning

## Troubleshooting

### If publishing still fails:

1. **Check GitHub Actions permissions:**
   - Go to: Settings > Actions > General > Workflow permissions
   - Ensure "Read and write permissions" is enabled

2. **Verify package visibility:**
   - Published packages are private by default
   - Go to each package → Settings → Change visibility to "Public"

3. **Check for build errors:**
   - Run `pnpm build` locally to verify all packages build correctly

### If installation fails:

1. **Authenticate with GitHub:**

   ```bash
   npm login --scope=@sv-sdk --registry=https://npm.pkg.github.com
   ```

2. **Use a .npmrc file:**
   ```
   @sv-sdk:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

## Summary

The publishing issues have been resolved by:

1. ✅ Adding `"files": ["src"]` to all package.json files
2. ✅ Removing the duplicate `release.yml` workflow

Your packages should now publish successfully to GitHub Packages when you push to main!
