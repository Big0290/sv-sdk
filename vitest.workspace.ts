import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Workspace packages
  {
    extends: './vitest.config.ts',
    test: {
      name: 'shared',
      include: ['packages/shared/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'db-config',
      include: ['packages/db-config/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'validators',
      include: ['packages/validators/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'cache',
      include: ['packages/cache/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'core',
      include: ['packages/core/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'security',
      include: ['packages/security/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'auth',
      include: ['packages/auth/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'audit',
      include: ['packages/audit/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'email',
      include: ['packages/email/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'permissions',
      include: ['packages/permissions/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'ui',
      include: ['packages/ui/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'cli',
      include: ['packages/cli/src/**/*.test.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'observability',
      include: ['packages/observability/src/**/*.test.ts'],
    },
  },
  // Integration tests
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: ['test/integration/**/*.test.ts'],
      testTimeout: 30000,
    },
  },
])
