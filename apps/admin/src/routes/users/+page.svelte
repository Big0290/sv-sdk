<script lang="ts">
  import type { PageData } from './$types'
  import { Button, Input } from '@sv-sdk/ui'
  import { goto } from '$app/navigation'

  const { data }: { data: PageData } = $props()

  let searchQuery = $state('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    goto(`/users?${params.toString()}`)
  }
</script>

<div class="p-8">
  <div class="page-header flex items-center justify-between">
    <div>
      <h1 class="page-title">Users</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage user accounts and permissions
      </p>
    </div>
    <Button variant="primary" onclick={() => goto('/users/create')}>
      + Add User
    </Button>
  </div>

  <!-- Search and filters -->
  <div class="mb-6 flex gap-4">
    <div class="flex-1">
      <Input
        type="search"
        placeholder="Search by email or name..."
        bind:value={searchQuery}
        oninput={handleSearch}
      />
    </div>
    <Button variant="outline">
      Filter
    </Button>
  </div>

  <!-- Users table -->
  <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.users.data as user}
          <tr>
            <td>
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p class="font-medium">{user.name || 'No name'}</p>
                </div>
              </div>
            </td>
            <td>{user.email}</td>
            <td>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                {user.role}
              </span>
            </td>
            <td>
              {#if user.isActive}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Active
                </span>
              {:else}
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  Inactive
                </span>
              {/if}
            </td>
            <td class="text-gray-600 dark:text-gray-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td>
              <div class="flex items-center gap-2">
                <Button size="sm" variant="outline" onclick={() => goto(`/users/${user.id}`)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  ···
                </Button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Showing {data.users.data.length} of {data.users.pagination.totalCount} users
    </p>
    <div class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={data.users.pagination.page === 1}
        onclick={() => goto(`/users?page=${data.users.pagination.page - 1}`)}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={data.users.pagination.page >= data.users.pagination.totalPages}
        onclick={() => goto(`/users?page=${data.users.pagination.page + 1}`)}
      >
        Next
      </Button>
    </div>
  </div>
</div>

