# Changesets

This directory contains changeset files for managing package versions and changelogs.

## Usage

### Adding a Changeset

After making changes to packages:

```bash
pnpm changeset
```

Follow the prompts to:
1. Select which packages changed
2. Choose version bump type (major, minor, patch)
3. Write a summary of changes

### Versioning Packages

Update package versions based on changesets:

```bash
pnpm changeset version
```

This will:
- Update package.json versions
- Update CHANGELOG.md files
- Remove consumed changesets

### Publishing Packages

Publish updated packages to npm:

```bash
pnpm changeset publish
```

## Automated Releases

The `.github/workflows/release.yml` workflow automatically:
- Creates release PRs when changesets are added
- Publishes packages when release PRs are merged

## Learn More

- [Changesets Documentation](https://github.com/changesets/changesets)
- [SemVer Guide](https://semver.org/)

