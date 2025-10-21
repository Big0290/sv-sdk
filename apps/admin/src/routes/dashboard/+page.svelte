<script lang="ts">
	import type { PageData } from './$types';
	import { Card } from '@sv-sdk/ui';

	const { data }: { data: PageData } = $props();

	const stats = [
		{
			label: 'Total Users',
			value: data.stats.totalUsers,
			change: '+12%',
			icon: '👥',
			color: 'blue'
		},
		{
			label: 'Emails Sent Today',
			value: data.stats.emailsSentToday,
			change: '+5%',
			icon: '📧',
			color: 'green'
		},
		{
			label: 'Audit Events',
			value: data.stats.auditEvents,
			change: '+8%',
			icon: '📝',
			color: 'purple'
		},
		{
			label: 'Active Sessions',
			value: data.stats.activeSessions,
			change: '-3%',
			icon: '🔒',
			color: 'orange'
		}
	];
</script>

<div class="p-8">
	<div class="page-header">
		<h1 class="page-title">Dashboard</h1>
		<p class="text-gray-600 dark:text-gray-400 mt-1">
			Welcome back, {data.user?.name || data.user?.email}!
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		{#each stats as stat}
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="stat-label">{stat.label}</p>
						<p class="stat-value">{stat.value.toLocaleString()}</p>
						<p class="text-sm text-green-600 dark:text-green-400 mt-1">
							{stat.change} from last month
						</p>
					</div>
					<span class="text-4xl">{stat.icon}</span>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<Card>
			<h2 class="text-lg font-semibold mb-4">Recent Audit Events</h2>
			<div class="space-y-3">
				{#each data.recentAuditEvents as event}
					<div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<span class="text-xl">📝</span>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
								{event.eventType}
							</p>
							<p class="text-xs text-gray-600 dark:text-gray-400">
								{new Date(event.createdAt).toLocaleString()}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<Card>
			<h2 class="text-lg font-semibold mb-4">System Health</h2>
			<div class="space-y-3">
				<div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
					<span class="text-sm font-medium">Database</span>
					<span class="text-green-600 dark:text-green-400">✓ Healthy</span>
				</div>
				<div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
					<span class="text-sm font-medium">Redis</span>
					<span class="text-green-600 dark:text-green-400">✓ Healthy</span>
				</div>
				<div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
					<span class="text-sm font-medium">Email Queue</span>
					<span class="text-green-600 dark:text-green-400">✓ Healthy</span>
				</div>
			</div>
		</Card>
	</div>
</div>
