<script lang="ts">
	import { Button, Input, Alert } from '@sv-sdk/ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';

	async function handleSubmit() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Login failed';
				return;
			}

			// Redirect to dashboard or requested page
			goto(redirectTo);
		} catch (err) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">SV-SDK Admin</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
		</div>

		<div
			class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800"
		>
			{#if error}
				<Alert variant="error" class="mb-4" dismissible>
					{error}
				</Alert>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4">
				<Input
					type="email"
					label="Email"
					bind:value={email}
					placeholder="admin@example.com"
					required
					disabled={loading}
				/>

				<Input
					type="password"
					label="Password"
					bind:value={password}
					placeholder="••••••••"
					required
					disabled={loading}
				/>

				<Button type="submit" variant="primary" fullWidth {loading}>
					{loading ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>

			<div class="mt-4 text-center">
				<a
					href="/reset-password"
					class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
				>
					Forgot your password?
				</a>
			</div>
		</div>

		<p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
			Default credentials: admin@example.com / Admin123!
		</p>
	</div>
</div>
