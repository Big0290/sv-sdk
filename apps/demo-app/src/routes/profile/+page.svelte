<script lang="ts">
  import type { PageData } from './$types'
  import { Button, Input, Card, Alert } from '@sv-sdk/ui'

  const { data }: { data: PageData } = $props()

  let name = $state(data.user?.name || '')
  let success = $state(false)
  let error = $state('')

  async function updateProfile() {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        success = true
        setTimeout(() => (success = false), 3000)
      } else {
        error = 'Failed to update profile'
      }
    } catch (err) {
      error = 'An error occurred'
    }
  }
</script>

<svelte:head>
  <title>Profile - SV-SDK Demo</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
    My Profile
  </h1>

  {#if success}
    <Alert variant="success" class="mb-6" dismissible>
      Profile updated successfully!
    </Alert>
  {/if}

  {#if error}
    <Alert variant="error" class="mb-6" dismissible>
      {error}
    </Alert>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Profile Info -->
    <div class="lg:col-span-2 space-y-6">
      <Card>
        <h2 class="text-lg font-semibold mb-4">Profile Information</h2>
        <div class="space-y-4">
          <Input label="Email" value={data.user?.email} disabled />
          <Input label="Name" bind:value={name} />
          <Button variant="primary" onclick={updateProfile}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Card>
        <h2 class="text-lg font-semibold mb-4">Security</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Keep your account secure
        </p>
        <Button variant="outline">
          Change Password
        </Button>
      </Card>
    </div>

    <!-- Account Details -->
    <div class="space-y-6">
      <Card>
        <h2 class="text-lg font-semibold mb-4">Account Details</h2>
        <dl class="space-y-3">
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">Role</dt>
            <dd class="mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                {data.user?.role}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified</dt>
            <dd class="mt-1 text-sm">
              {#if data.user?.emailVerified}
                <span class="text-green-600 dark:text-green-400">✓ Verified</span>
              {:else}
                <span class="text-yellow-600 dark:text-yellow-400">⚠ Not verified</span>
              {/if}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  </div>
</div>

