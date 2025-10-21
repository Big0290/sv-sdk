<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Input, Select, Card, Alert, Tabs } from '@sv-sdk/ui';
	import { goto } from '$app/navigation';

	const { data }: { data: PageData } = $props();

	let name = $state(data.user.name || '');
	let role = $state(data.user.role);
	let isActive = $state(data.user.isActive);
	let success = $state(false);
	let error = $state('');
	let loading = $state(false);

	const tabs = [
		{ id: 'profile', label: 'Profile', icon: '👤' },
		{ id: 'audit', label: 'Audit History', icon: '📝' },
		{ id: 'sessions', label: 'Sessions', icon: '🔒' }
	];

	let activeTab = $state('profile');

	async function handleUpdate() {
		loading = true;
		error = '';
		success = false;

		try {
			const response = await fetch(`/api/v1/users/${data.user.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, role, isActive })
			});

			if (!response.ok) {
				const result = await response.json();
				error = result.error || 'Failed to update user';
				return;
			}

			success = true;
			setTimeout(() => (success = false), 3000);
		} catch (err) {
			error = 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-8">
	<div class="page-header flex items-center justify-between">
		<div>
			<h1 class="page-title">Edit User</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">
				{data.user.email}
			</p>
		</div>
		<Button variant="outline" onclick={() => goto('/users')}>Back to Users</Button>
	</div>

	{#if success}
		<Alert variant="success" class="mb-6" dismissible>User updated successfully!</Alert>
	{/if}

	{#if error}
		<Alert variant="error" class="mb-6" dismissible>
			{error}
		</Alert>
	{/if}

	<Tabs {tabs} bind:activeTab>
		{#if activeTab === 'profile'}
			<Card>
				<h2 class="text-lg font-semibold mb-4">User Information</h2>
				<form onsubmit={handleUpdate} class="space-y-4">
					<Input label="Email" value={data.user.email} disabled />
					<Input label="Name" bind:value={name} />
					<Select
						label="Role"
						bind:value={role}
						options={data.roles.map((r) => ({ value: r.name, label: r.name }))}
					/>

					<div class="flex items-center gap-2">
						<input type="checkbox" id="isActive" bind:checked={isActive} class="h-4 w-4 rounded" />
						<label for="isActive" class="text-sm text-gray-700 dark:text-gray-300">
							Active Account
						</label>
					</div>

					<div class="flex gap-4">
						<Button type="submit" variant="primary" {loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
						<Button variant="outline" type="button" onclick={() => goto('/users')}>Cancel</Button>
					</div>
				</form>
			</Card>
		{:else if activeTab === 'audit'}
			<Card>
				<h2 class="text-lg font-semibold mb-4">Audit History</h2>
				<div class="space-y-2">
					{#each data.auditHistory as log}
						<div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<span class="text-xl">📝</span>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{log.eventType}
								</p>
								<p class="text-xs text-gray-600 dark:text-gray-400">
									{new Date(log.createdAt).toLocaleString()}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{:else if activeTab === 'sessions'}
			<Card>
				<h2 class="text-lg font-semibold mb-4">Active Sessions</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">Session management coming soon...</p>
			</Card>
		{/if}
	</Tabs>
</div>
