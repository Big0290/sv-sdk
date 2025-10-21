<script lang="ts">
  import { Button, Card } from '@sv-sdk/ui'

  const features = [
    {
      icon: '🔐',
      title: 'Authentication',
      description: 'Secure user authentication with email verification and password reset.',
    },
    {
      icon: '🔑',
      title: 'Permissions',
      description: 'Role-based access control with resource-level permissions.',
    },
    {
      icon: '📧',
      title: 'Email System',
      description: 'MJML templates, queue processing, and delivery tracking.',
    },
    {
      icon: '📊',
      title: 'Audit Logging',
      description: 'Comprehensive audit trail with PII masking and compliance.',
    },
    {
      icon: '⚡',
      title: 'Caching',
      description: 'Redis-backed caching for high performance.',
    },
    {
      icon: '🎨',
      title: 'UI Components',
      description: 'Accessible Svelte 5 components with dark mode.',
    },
  ]
</script>

<svelte:head>
  <title>SV-SDK Demo - Production-Ready Svelte 5 Platform</title>
</svelte:head>

<!-- Hero Section -->
<section class="hero">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
      Production-Ready<br />
      <span class="text-primary-600 dark:text-primary-400">Svelte 5 SDK</span>
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      Complete platform with authentication, permissions, email, audit logging, and more.
    </p>
    <div class="flex gap-4 justify-center">
      <Button variant="primary" size="lg" onclick={() => (window.location.href = '/signup')}>Get Started</Button>
      <Button variant="outline" size="lg" onclick={() => (window.location.href = '/features')}>Explore Features</Button>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Everything You Need</h2>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each features as feature}
      <div class="feature-card">
        <div class="text-4xl mb-4">{feature.icon}</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {feature.title}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    {/each}
  </div>
</section>

<!-- Code Example Section -->
<section class="bg-gray-100 dark:bg-gray-900 py-20">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Simple to Use</h2>

    <div class="code-block">
      <pre>{`import { login, signup } from '@sv-sdk/auth'
import { can, enforce } from '@sv-sdk/permissions'
import { sendEmail } from '@sv-sdk/email'

// Authenticate user
const result = await login({
  email: 'user@example.com',
  password: 'password'
})

// Check permission
if (await can(userId, 'update:any:user')) {
  // User can update any user
}

// Send email
await sendEmail('welcome', user.email, {
  userName: user.name
})`}</pre>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
  <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to get started?</h2>
  <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">Create an account and explore all features.</p>
  <Button variant="primary" size="lg" onclick={() => (window.location.href = '/signup')}>Sign Up Now</Button>
</section>
