<script lang="ts">
  import type { PageData } from './$types'
  import { Button, Card, Alert } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'

  const { data }: { data: PageData } = $props()

  async function testTemplate(templateId: string) {
    const email = prompt('Enter test email address:')
    if (!email) return

    try {
      const response = await fetch('/api/templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, email }),
      })

      if (response.ok) {
        alert('Test email sent successfully!')
      } else {
        alert('Failed to send test email')
      }
    } catch (error) {
      alert('Error sending test email')
    }
  }
</script>

<div class="p-8">
  <div class="page-header flex items-center justify-between">
    <div>
      <h1 class="page-title">Email Templates</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage MJML email templates
      </p>
    </div>
    <Button variant="primary" onclick={() => goto('/templates/create')}>
      + Create Template
    </Button>
  </div>

  <!-- Templates Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.templates as template}
      <Card>
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {template.name}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {template.locale} · v{template.version}
            </p>
          </div>
          {#if template.isActive}
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Active
            </span>
          {:else}
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              Inactive
            </span>
          {/if}
        </div>

        <div class="mb-4">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject:
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {template.subject}
          </p>
        </div>

        <div class="mb-4">
          <p class="text-xs text-gray-500 dark:text-gray-500">
            Variables: {template.variables.join(', ')}
          </p>
        </div>

        <div class="flex gap-2">
          <Button size="sm" variant="outline" fullWidth onclick={() => goto(`/templates/${template.id}`)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onclick={() => testTemplate(template.id)}>
            Test
          </Button>
        </div>
      </Card>
    {/each}
  </div>
</div>

