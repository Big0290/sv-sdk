<script lang="ts">
  import { Button, Input, Alert } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'

  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let name = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleSignup() {
    loading = true
    error = ''

    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      loading = false
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        error = data.error || 'Signup failed'
        return
      }

      goto('/verify-email?email=' + encodeURIComponent(email))
    } catch (err) {
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Sign Up - SV-SDK Demo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Create Account
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Get started with SV-SDK
      </p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      {#if error}
        <Alert variant="error" class="mb-4" dismissible>
          {error}
        </Alert>
      {/if}

      <form onsubmit={handleSignup} class="space-y-4">
        <Input
          label="Full Name"
          bind:value={name}
          placeholder="John Doe"
          required
        />

        <Input
          type="email"
          label="Email"
          bind:value={email}
          placeholder="you@example.com"
          required
        />

        <Input
          type="password"
          label="Password"
          bind:value={password}
          placeholder="••••••••"
          required
        />

        <Input
          type="password"
          label="Confirm Password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <a href="/login" class="text-primary-600 dark:text-primary-400 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  </div>
</div>

