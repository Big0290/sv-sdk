import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect root to dashboard if logged in, otherwise to login
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	throw redirect(302, '/login');
};
