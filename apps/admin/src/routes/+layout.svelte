<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	const { data, children } = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: '📊' },
		{ name: 'Users', href: '/users', icon: '👥' },
		{ name: 'Roles', href: '/roles', icon: '🔐' },
		{ name: 'Audit Logs', href: '/audit', icon: '📝' },
		{ name: 'Email Templates', href: '/templates', icon: '📧' },
		{ name: 'Email Analytics', href: '/emails', icon: '📈' },
		{ name: 'Settings', href: '/settings', icon: '⚙️' }
	];

	const isActive = (href: string) => $page.url.pathname.startsWith(href);
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-950">
	<!-- Sidebar -->
	{#if data.user}
		<aside class="sidebar fixed inset-y-0 left-0 z-50">
			<div class="flex h-full flex-col">
				<!-- Logo -->
				<div
					class="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800"
				>
					<h1 class="text-xl font-bold text-primary-600 dark:text-primary-400">SV-SDK Admin</h1>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 space-y-1 px-3 py-4">
					{#each navigation as item}
						<a href={item.href} class="nav-item" class:active={isActive(item.href)}>
							<span class="text-xl">{item.icon}</span>
							<span>{item.name}</span>
						</a>
					{/each}
				</nav>

				<!-- User section -->
				<div class="border-t border-gray-200 dark:border-gray-800 p-4">
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
								{data.user.name || data.user.email}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{data.user.role}
							</p>
						</div>
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
								title="Logout"
							>
								🚪
							</button>
						</form>
					</div>
				</div>
			</div>
		</aside>
	{/if}

	<!-- Main content -->
	<main class="flex-1" class:ml-64={data.user}>
		<div class="h-full overflow-y-auto">
			{@render children?.()}
		</div>
	</main>
</div>
