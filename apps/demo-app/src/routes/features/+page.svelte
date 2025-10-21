<script lang="ts">
  import { Card } from '@sv-sdk/ui'

  const packages = [
    {
      name: '@sv-sdk/auth',
      description: 'Complete authentication system with BetterAuth integration',
      features: ['Email/password auth', 'Email verification', 'Password reset', 'Session management'],
    },
    {
      name: '@sv-sdk/permissions',
      description: 'RBAC system with caching and resource-level permissions',
      features: ['Role-based access', 'Permission caching', 'Resource ownership', 'Audit logging'],
    },
    {
      name: '@sv-sdk/email',
      description: 'Email system with MJML templates and queue processing',
      features: ['MJML templates', 'Multi-provider', 'Queue processing', 'Delivery tracking'],
    },
    {
      name: '@sv-sdk/audit',
      description: 'Comprehensive audit logging with PII handling',
      features: ['Append-only logs', 'PII masking', 'Retention policies', 'Export (CSV/JSON)'],
    },
    {
      name: '@sv-sdk/ui',
      description: 'Accessible Svelte 5 component library',
      features: ['Tailwind CSS', 'Dark mode', 'WCAG 2.1 AA', 'Responsive'],
    },
    {
      name: '@sv-sdk/cli',
      description: 'Command-line tools for administration',
      features: ['User management', 'Email testing', 'Audit export', 'Health checks'],
    },
  ]
</script>

<svelte:head>
  <title>Features - SV-SDK Demo</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">Platform Features</h1>
    <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">
      Everything you need to build production-ready applications
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    {#each packages as pkg}
      <Card>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {pkg.name}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {pkg.description}
        </p>
        <ul class="space-y-2">
          {#each pkg.features as feature}
            <li class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span class="text-green-500">✓</span>
              {feature}
            </li>
          {/each}
        </ul>
      </Card>
    {/each}
  </div>

  <!-- Tech Stack -->
  <div class="mt-16">
    <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Built With Modern Tech Stack</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      {#each ['Svelte 5', 'SvelteKit', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Redis', 'Drizzle ORM', 'BetterAuth'] as tech}
        <div class="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p class="font-medium text-gray-900 dark:text-gray-100">{tech}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
