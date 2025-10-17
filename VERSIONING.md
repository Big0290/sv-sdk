# Package Versioning Strategy

## Overview

The SV-SDK monorepo follows semantic versioning (SemVer) for all packages. This document outlines our versioning strategy, release process, and compatibility guarantees.

---

## Semantic Versioning

All packages follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes that require user intervention
- **MINOR**: New features that are backward-compatible
- **PATCH**: Bug fixes and internal improvements

### Examples

- `1.0.0` → `1.0.1`: Bug fix (safe to update)
- `1.0.0` → `1.1.0`: New feature (safe to update)
- `1.0.0` → `2.0.0`: Breaking change (read changelog before updating)

---

## Package Independence

Each package in the monorepo has its own version number and can be released independently:

```
@sv-sdk/auth@1.2.3
@sv-sdk/email@2.0.1
@sv-sdk/ui@0.5.0
```

### Why Independent Versioning?

1. **Flexibility**: Packages can evolve at different rates
2. **Clarity**: Version numbers reflect actual changes to each package
3. **Stability**: Core packages can remain stable while experimental features move faster
4. **User Control**: Users can update packages individually based on their needs

---

## Version Compatibility

### Inter-Package Dependencies

Packages specify compatible version ranges for internal dependencies:

```json
{
  "dependencies": {
    "@sv-sdk/shared": "^1.0.0",
    "@sv-sdk/db-config": "^1.2.0"
  }
}
```

**Rules**:

- Use caret (`^`) for minor version flexibility: `^1.2.0` allows `1.2.x` and `1.x.x` (where x ≥ 2)
- Lock major versions to prevent breaking changes
- Document minimum required versions in package README

### Application Dependencies

Applications (`apps/*`) should pin exact versions or use strict ranges:

```json
{
  "dependencies": {
    "@sv-sdk/auth": "1.2.3",
    "@sv-sdk/ui": "~2.1.0"
  }
}
```

---

## Pre-release Versions

For experimental features and beta testing:

```
1.0.0-alpha.1    # Early testing
1.0.0-beta.1     # Feature complete, testing
1.0.0-rc.1       # Release candidate
```

**Usage**:

- Use alpha for early development
- Use beta for feature-complete testing
- Use rc for final validation before stable release

---

## Version Lifecycle

### 1. Development Phase

Start at `0.x.x` for packages under active development:

```
0.1.0 → 0.2.0 → 0.3.0 → ... → 1.0.0
```

**Characteristics**:

- Breaking changes allowed in minor versions
- No backward compatibility guarantees
- Rapid iteration

### 2. Stable Phase

Once a package reaches `1.0.0`:

```
1.0.0 → 1.1.0 → 1.2.0 → 2.0.0
```

**Guarantees**:

- No breaking changes in minor or patch releases
- Deprecation warnings before removal
- Clear migration guides for major versions

### 3. Maintenance Phase

Older major versions receive security patches:

```
1.x.x (security patches only)
2.x.x (current stable)
3.x.x (latest)
```

**Support Policy**:

- Latest 2 major versions receive active support
- Security patches for 3 major versions
- Deprecation timeline: 6 months notice

---

## Breaking Changes

### What Constitutes a Breaking Change?

**API Changes**:

- Removing public functions/classes
- Changing function signatures
- Changing return types
- Renaming exports

**Behavior Changes**:

- Changing default values
- Altering error handling
- Modifying validation rules
- Database schema changes

**Dependency Changes**:

- Updating peer dependencies (major versions)
- Removing dependencies that users rely on

### Non-Breaking Changes

**Safe Changes**:

- Adding new functions/classes
- Adding optional parameters
- Deprecating (with warnings)
- Internal refactoring
- Performance improvements
- Bug fixes

---

## Deprecation Policy

### Step 1: Deprecation Warning

Add deprecation notice in code and documentation:

```typescript
/**
 * @deprecated Use `newFunction()` instead. Will be removed in v2.0.0.
 */
export function oldFunction() {
  console.warn('oldFunction is deprecated, use newFunction instead')
  return newFunction()
}
```

### Step 2: Migration Period

Minimum 3 months (or 1 major version) before removal:

- Provide migration guide
- Update documentation
- Show warnings in console (development only)
- Offer automated migration tools (if possible)

### Step 3: Removal

Remove in next major version:

```markdown
## v2.0.0 (Breaking Changes)

### Removed

- `oldFunction()` - Use `newFunction()` instead (see migration guide)
```

---

## Release Process

### 1. Changesets

We use [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add a changeset after making changes
pnpm changeset

# Version packages (updates CHANGELOG.md)
pnpm changeset version

# Publish packages
pnpm changeset publish
```

### 2. Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.0] - 2024-01-15

### Added

- New `sendBulkEmail()` function for batch sending

### Changed

- Improved template rendering performance by 40%

### Deprecated

- `oldTemplateEngine` - Use `newTemplateEngine` instead

### Removed

- N/A

### Fixed

- Fix race condition in queue processing
- Resolve memory leak in cache invalidation

### Security

- Patch XSS vulnerability in template renderer
```

### 3. Git Tags

Tag releases with package name and version:

```bash
git tag @sv-sdk/auth@1.2.0
git push origin @sv-sdk/auth@1.2.0
```

---

## Version Matrix

### Current Package Versions (Example)

| Package               | Version | Status | Notes                |
| --------------------- | ------- | ------ | -------------------- |
| @sv-sdk/shared        | 1.0.0   | Stable | Core utilities       |
| @sv-sdk/db-config     | 1.1.0   | Stable | Database layer       |
| @sv-sdk/validators    | 1.0.0   | Stable | Validation utilities |
| @sv-sdk/cache         | 1.0.0   | Stable | Redis caching        |
| @sv-sdk/core          | 1.0.0   | Stable | SDK core             |
| @sv-sdk/security      | 1.0.0   | Stable | Security utilities   |
| @sv-sdk/auth          | 1.2.3   | Stable | Authentication       |
| @sv-sdk/audit         | 1.1.0   | Stable | Audit logging        |
| @sv-sdk/email         | 2.0.1   | Stable | Email system         |
| @sv-sdk/permissions   | 1.0.0   | Stable | RBAC system          |
| @sv-sdk/ui            | 0.5.0   | Beta   | UI components        |
| @sv-sdk/cli           | 1.0.0   | Stable | CLI tools            |
| @sv-sdk/observability | 0.3.0   | Alpha  | Monitoring           |

---

## Migration Guides

### Major Version Upgrades

Each major version includes a migration guide:

```
docs/migrations/
├── auth-v1-to-v2.md
├── email-v1-to-v2.md
└── ui-v0-to-v1.md
```

**Migration Guide Template**:

```markdown
# Migrating from v1 to v2

## Breaking Changes

### 1. Function Signature Changes

**Before:**
\`\`\`typescript
function sendEmail(to: string, subject: string, body: string)
\`\`\`

**After:**
\`\`\`typescript
function sendEmail(options: SendEmailOptions)
\`\`\`

### 2. Configuration Changes

...

## Automated Migration

Run the migration tool:
\`\`\`bash
npx @sv-sdk/migrate auth v1-to-v2
\`\`\`
```

---

## Best Practices

### For Package Developers

1. **Think Before Breaking**: Avoid breaking changes when possible
2. **Use Deprecation**: Always deprecate before removing
3. **Document Changes**: Update CHANGELOG.md and migration guides
4. **Version Carefully**: Choose the right version bump
5. **Test Thoroughly**: Ensure backward compatibility

### For Package Users

1. **Read Changelogs**: Review changes before updating
2. **Test Updates**: Test in development before production
3. **Pin Versions**: Use exact versions in production apps
4. **Stay Current**: Update regularly for security patches
5. **Report Issues**: File bug reports for breaking changes

---

## FAQ

### Q: When should I release a new major version?

**A**: When you make changes that require users to modify their code. Examples:

- Removing public APIs
- Changing function signatures
- Altering behavior in non-backward-compatible ways

### Q: Can I skip version numbers?

**A**: No. Follow SemVer strictly. Jump from 1.2.3 to 2.0.0, not 1.2.3 to 3.0.0.

### Q: How do I handle security patches for old versions?

**A**: Backport critical security fixes to the latest patch version of each supported major version:

- `1.2.9` (old major version)
- `2.3.5` (current major version)
- `3.1.2` (latest version)

### Q: What if I accidentally publish a breaking change in a minor version?

**A**:

1. Acknowledge the mistake
2. Release a patch version that reverts the change
3. Release a new major version with the breaking change
4. Document the incident

---

## Resources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Node.js Package Versioning Guide](https://nodejs.org/en/docs/guides/publishing-npm-packages/)
