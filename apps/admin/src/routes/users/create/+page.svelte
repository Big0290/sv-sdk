<script lang="ts">
	import { Button, Input, Select, Alert } from '@sv-sdk/ui';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let email = $state('');
	let name = $state('');
	let role = $state('user');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/v1/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, role })
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to create user';
				return;
			}

			goto('/users');
		} catch (err) {
			error = 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-8">
	<div class="page-header">
		<h1 class="page-title">Create User</h1>
		<p class="text-gray-600 dark:text-gray-400 mt-1">Add a new user to the system</p>
	</div>

	<div class="max-w-2xl">
		{#if error}
			<Alert variant="error" class="mb-6" dismissible>
				{error}
			</Alert>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-6">
			<Input
				type="email"
				label="Email"
				bind:value={email}
				placeholder="user@example.com"
				required
			/>

			<Input label="Full Name" bind:value={name} placeholder="John Doe" required />

			<Select
				label="Role"
				bind:value={role}
				options={data.roles.map((r) => ({ value: r.name, label: r.name }))}
				required
			/>

			<div class="flex gap-4">
				<Button type="submit" variant="primary" {loading}>
					{loading ? 'Creating...' : 'Create User'}
				</Button>
				<Button variant="outline" onclick={() => goto('/users')}>Cancel</Button>
			</div>
		</form>
	</div>
</div>
