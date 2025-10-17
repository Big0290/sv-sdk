import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { login } from '@sv-sdk/auth';
import { logAudit } from '@sv-sdk/audit';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Attempt login
		const result = await login({ email, password }, { ipAddress: getClientAddress() });

		if (!result.success) {
			// Log failed attempt
			await logAudit('auth.login.failed', {
				email,
				ipAddress: getClientAddress(),
				reason: 'Invalid credentials'
			});

			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Log successful login
		await logAudit('auth.login.success', {
			userId: result.data.user.id,
			email: result.data.user.email,
			ipAddress: getClientAddress()
		});

		return json({
			success: true,
			user: result.data.user
		});
	} catch (error) {
		return json({ error: 'An error occurred during login' }, { status: 500 });
	}
};
