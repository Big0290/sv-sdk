import type { PageServerLoad } from './$types';
import { getUserById } from '@big0290/auth';
import { getRoles } from '@big0290/permissions';
import { fetchAuditLogs } from '@big0290/audit';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const user = await getUserById(params.id);

	if (!user) {
		throw error(404, 'User not found');
	}

	const roles = await getRoles();
	const auditHistory = await fetchAuditLogs({ userId: params.id }, { page: 1, pageSize: 20 });

	return {
		user,
		roles,
		auditHistory: auditHistory.data
	};
};
