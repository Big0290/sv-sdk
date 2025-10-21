<script lang="ts">
  import { page } from '$app/stores'
  import { Alert, Button, Spinner } from '@sv-sdk/ui'
  import { onMount } from 'svelte'

  let status = $state<'verifying' | 'success' | 'error'>('verifying')
  let message = $state('')

  const token = $page.url.searchParams.get('token')

  onMount(async () => {
    if (!token) {
      status = 'error'
      message = 'Invalid verification link'
      return
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        status = 'success'
        message = 'Email verified successfully!'
      } else {
        status = 'error'
        message = 'Verification failed. The link may have expired.'
      }
    } catch (error) {
      status = 'error'
      message = 'An error occurred during verification.'
    }
  })
</script>

<svelte:head>
  <title>Verify Email - SV-SDK Demo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md text-center">
    <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      {#if status === 'verifying'}
        <Spinner size="lg" class="mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verifying Email...</h1>
        <p class="text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
      {:else if status === 'success'}
        <div class="text-6xl mb-4">✅</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Verified!</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <Button variant="primary" onclick={() => (window.location.href = '/login')}>Continue to Login</Button>
      {:else}
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Failed</h1>
        <Alert variant="error" class="mb-6">
          {message}
        </Alert>
        <div class="flex gap-2 justify-center">
          <Button variant="outline" onclick={() => (window.location.href = '/signup')}>Sign Up Again</Button>
          <Button variant="primary" onclick={() => (window.location.href = '/login')}>Go to Login</Button>
        </div>
      {/if}
    </div>
  </div>
</div>
