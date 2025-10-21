<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Input, Card } from '@big0290/ui';
	import { goto } from '$app/navigation';

	const { data }: { data: PageData } = $props();

	let eventTypeFilter = $state('');
	let userIdFilter = $state('');

	function applyFilters() {
		const params = new URLSearchParams();
		if (eventTypeFilter) params.set('eventType', eventTypeFilter);
		if (userIdFilter) params.set('userId', userIdFilter);
		goto(`/audit?${params.toString()}`);
	}

	async function exportLogs(format: 'json' | 'csv') {
		const response = await fetch(`/api/audit/export?format=${format}`);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `audit-logs-${Date.now()}.${format}`;
		a.click();
	}
</script>

<div class="p-8">
	<div class="page-header flex items-center justify-between">
		<div>
			<h1 class="page-title">Audit Logs</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">View and export system audit trail</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => exportLogs('csv')}>Export CSV</Button>
			<Button variant="outline" onclick={() => exportLogs('json')}>Export JSON</Button>
		</div>
	</div>

	<!-- Filters -->
	<Card class="mb-6">
		<h3 class="text-sm font-medium mb-4">Filters</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Input label="Event Type" placeholder="e.g., user.login" bind:value={eventTypeFilter} />
			<Input label="User ID" placeholder="Filter by user..." bind:value={userIdFilter} />
			<div class="flex items-end">
				<Button variant="primary" onclick={applyFilters}>Apply Filters</Button>
			</div>
		</div>
	</Card>

	<!-- Logs Table -->
	<div
		class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
	>
		<table class="data-table">
			<thead>
				<tr>
					<th>Event Type</th>
					<th>User</th>
					<th>IP Address</th>
					<th>Timestamp</th>
					<th>Details</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logs.data as log}
					<tr>
						<td>
							<code class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
								{log.eventType}
							</code>
						</td>
						<td class="text-gray-600 dark:text-gray-400">
							{log.userId || 'System'}
						</td>
						<td class="text-gray-600 dark:text-gray-400">
							{log.ipAddress || 'N/A'}
						</td>
						<td class="text-gray-600 dark:text-gray-400">
							{new Date(log.createdAt).toLocaleString()}
						</td>
						<td>
							<Button size="sm" variant="ghost">View</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	<div class="mt-6 flex items-center justify-between">
		<p class="text-sm text-gray-600 dark:text-gray-400">
			Showing {data.logs.data.length} of {data.logs.pagination.totalCount} logs
		</p>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.logs.pagination.page === 1}
				onclick={() => goto(`/audit?page=${data.logs.pagination.page - 1}`)}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={data.logs.pagination.page >= data.logs.pagination.totalPages}
				onclick={() => goto(`/audit?page=${data.logs.pagination.page + 1}`)}
			>
				Next
			</Button>
		</div>
	</div>
</div>
