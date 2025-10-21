<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Card } from '@sv-sdk/ui';
	import { goto } from '$app/navigation';

	const { data }: { data: PageData } = $props();
</script>

<div class="p-8">
	<div class="page-header flex items-center justify-between">
		<div>
			<h1 class="page-title">Roles & Permissions</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">Manage user roles and permissions</p>
		</div>
		<Button variant="primary" onclick={() => goto('/roles/create')}>+ Create Role</Button>
	</div>

	<!-- Roles Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.roles as role}
			<Card>
				<div class="flex items-start justify-between mb-4">
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{role.name}
						</h3>
						{#if role.isSystem}
							<span
								class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 mt-1"
							>
								System Role
							</span>
						{/if}
					</div>
					<Button size="sm" variant="outline" onclick={() => goto(`/roles/${role.id}`)}>
						Edit
					</Button>
				</div>

				<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
					{role.description || 'No description'}
				</p>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600 dark:text-gray-400">Permissions:</span>
						<span class="font-medium">{role.permissions.length}</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600 dark:text-gray-400">Users:</span>
						<span class="font-medium">{role.userCount || 0}</span>
					</div>
				</div>

				{#if !role.isSystem}
					<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
						<Button size="sm" variant="ghost" fullWidth>Delete Role</Button>
					</div>
				{/if}
			</Card>
		{/each}
	</div>
</div>
