import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logout } from '@sv-sdk/auth';
import { logAudit } from '@sv-sdk/audit';

export const POST: RequestHandler = async ({ locals }) => {
	if (locals.session) {
		// Log logout
		await logAudit('auth.logout', {
			userId: locals.user?.id
		});

		// Logout
		await logout(locals.session.token);
	}

	throw redirect(302, '/login');
};
