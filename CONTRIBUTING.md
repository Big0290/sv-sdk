# Contributing to SV-SDK

Thank you for your interest in contributing to SV-SDK! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build great software together.

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/your-username/sv-sdk.git
cd sv-sdk

# Add upstream remote
git remote add upstream https://github.com/original-org/sv-sdk.git
```

### 2. Setup Development Environment

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Run migrations
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for detailed setup.

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/my-feature
```

### 2. Make Changes

- Write code following our style guide
- Add tests for new features
- Update documentation
- Follow commit message conventions

### 3. Test Your Changes

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Build
pnpm build
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(auth): add MFA support"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/my-feature

# Create Pull Request on GitHub
```

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Scopes

- `auth` - Authentication package
- `email` - Email package
- `audit` - Audit package
- `permissions` - Permissions package
- `ui` - UI components
- `core` - Core SDK
- `security` - Security package
- `db` - Database
- `cli` - CLI package
- `docs` - Documentation

### Examples

```bash
feat(auth): add email verification flow
fix(email): resolve MJML compilation error
docs(readme): update installation instructions
refactor(permissions): simplify role checking logic
test(audit): add PII masking tests
chore(deps): update dependencies
```

---

## Code Style

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` type (use `unknown` instead)
- Use type inference where possible
- Document complex types

### Formatting

- Use Prettier (auto-format on save)
- 2 spaces for indentation
- Single quotes
- No semicolons
- 120 character line length

### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and types
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names (avoid abbreviations)

### File Organization

```
package/
├── src/
│   ├── index.ts         # Public exports
│   ├── types.ts         # Type definitions
│   ├── utils.ts         # Utilities
│   └── __tests__/       # Tests
├── README.md            # Documentation
└── package.json         # Package config
```

---

## Testing Requirements

### Unit Tests

- **Required** for all new features
- **Coverage**: Aim for 80%+ on business logic
- **Location**: `src/__tests__/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

### Integration Tests

- **Required** for cross-package features
- **Location**: `test/integration/*.test.ts`

### E2E Tests

- **Required** for user-facing features
- **Framework**: Playwright
- **Location**: `apps/*/e2e/*.test.ts`

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @sv-sdk/auth test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Changeset added (if applicable)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Changeset added
```

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one approval required
3. **Testing**: Reviewer tests changes
4. **Approval**: Merge once approved

---

## Package Development

### Creating a New Package

```bash
# Create package structure
mkdir -p packages/my-package/src

# Create package.json
cat > packages/my-package/package.json << EOF
{
  "name": "@sv-sdk/my-package",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "dependencies": {}
}
EOF

# Install dependencies
pnpm install
```

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter @sv-sdk/my-package add some-package

# Add workspace dependency
pnpm --filter @sv-sdk/my-package add @sv-sdk/shared@workspace:*
```

### Versioning

See [VERSIONING.md](./VERSIONING.md) for package versioning strategy.

---

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in comments
- Document edge cases and caveats

```typescript
/**
 * Send email using template
 *
 * @param templateName - Name of template to use
 * @param recipient - Email recipient
 * @param variables - Template variables
 * @returns Job ID for tracking
 *
 * @example
 * ```typescript
 * const jobId = await sendEmail('welcome', 'user@example.com', {
 *   userName: 'John Doe'
 * })
 * ```
 */
export async function sendEmail(
  templateName: string,
  recipient: string,
  variables: Record<string, any>
): Promise<string>
```

### README Documentation

Each package should have:
- Feature list
- Installation instructions
- Usage examples
- API reference
- Troubleshooting

---

## Common Tasks

### Adding a Feature

1. Create feature branch
2. Write failing tests (TDD)
3. Implement feature
4. Ensure tests pass
5. Update documentation
6. Add changeset
7. Submit PR

### Fixing a Bug

1. Create bugfix branch
2. Write test reproducing bug
3. Fix the bug
4. Ensure test passes
5. Add changeset
6. Submit PR

### Updating Documentation

1. Create docs branch
2. Make documentation changes
3. Verify examples work
4. Submit PR

---

## Need Help?

- **Documentation**: Check the [docs](./docs/) folder
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Chat**: [Discord/Slack] (if available)

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in changelogs

Thank you for contributing to SV-SDK! 🎉

