<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from '@sv-sdk/ui'
</script>

<div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
      {$page.status}
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      {$page.error?.message || 'An error occurred'}
    </p>
    <div class="flex gap-4 justify-center">
      <Button variant="primary" onclick={() => window.history.back()}>
        Go Back
      </Button>
      <Button variant="outline" onclick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </Button>
    </div>
  </div>
</div>

