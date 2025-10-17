<script lang="ts">
  import { Button, Input, Alert } from '@sv-sdk/ui'
  import { page } from '$app/stores'

  let step = $state<'request' | 'reset'>($page.url.searchParams.has('token') ? 'reset' : 'request')
  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let success = $state(false)
  let error = $state('')
  let loading = $state(false)

  const token = $page.url.searchParams.get('token')

  async function handleRequestReset() {
    loading = true
    error = ''

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        success = true
      } else {
        error = 'Failed to send reset email'
      }
    } catch (err) {
      error = 'An error occurred'
    } finally {
      loading = false
    }
  }

  async function handleResetPassword() {
    loading = true
    error = ''

    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      loading = false
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (response.ok) {
        success = true
      } else {
        error = 'Failed to reset password'
      }
    } catch (err) {
      error = 'An error occurred'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Reset Password - SV-SDK Demo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Reset Password
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {step === 'request' ? 'Enter your email to receive reset instructions' : 'Create a new password'}
      </p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      {#if success}
        <Alert variant="success" class="mb-4">
          {step === 'request' ? 'Reset instructions sent to your email!' : 'Password reset successfully!'}
        </Alert>
        {#if step === 'reset'}
          <Button variant="primary" fullWidth onclick={() => window.location.href = '/login'}>
            Continue to Login
          </Button>
        {/if}
      {:else}
        {#if error}
          <Alert variant="error" class="mb-4" dismissible>
            {error}
          </Alert>
        {/if}

        {#if step === 'request'}
          <form onsubmit={handleRequestReset} class="space-y-4">
            <Input
              type="email"
              label="Email"
              bind:value={email}
              placeholder="you@example.com"
              required
            />

            <Button type="submit" variant="primary" fullWidth {loading}>
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
        {:else}
          <form onsubmit={handleResetPassword} class="space-y-4">
            <Input
              type="password"
              label="New Password"
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        {/if}

        <div class="mt-6 text-center">
          <a href="/login" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Back to Login
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>

