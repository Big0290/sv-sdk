<script lang="ts">
  import { Button, Input, Alert } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'

  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleLogin() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        error = data.error || 'Login failed'
        return
      }

      goto('/profile')
    } catch (err) {
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Login - SV-SDK Demo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Welcome Back
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Sign in to your account
      </p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      {#if error}
        <Alert variant="error" class="mb-4" dismissible>
          {error}
        </Alert>
      {/if}

      <form onsubmit={handleLogin} class="space-y-4">
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

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div class="mt-6 text-center space-y-2">
        <a href="/reset-password" class="text-sm text-primary-600 dark:text-primary-400 hover:underline block">
          Forgot password?
        </a>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <a href="/signup" class="text-primary-600 dark:text-primary-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

