import type { PageServerLoad } from './$types';
import { getUsers } from '@sv-sdk/auth';
import { fetchAuditLogs } from '@sv-sdk/audit';
import { getEmailStats } from '@sv-sdk/email';

export const load: PageServerLoad = async ({ locals }) => {
	// Get statistics
	const usersResult = await getUsers({}, { page: 1, pageSize: 1 });
	const emailStats = await getEmailStats();
	const recentAudits = await fetchAuditLogs({}, { page: 1, pageSize: 5 });

	return {
		user: locals.user,
		stats: {
			totalUsers: usersResult.pagination.totalCount,
			emailsSentToday: emailStats.sent, // Simplified - would calculate today's count
			auditEvents: recentAudits.pagination.totalCount,
			activeSessions: 42 // Simplified - would query actual sessions
		},
		recentAuditEvents: recentAudits.data.slice(0, 5)
	};
};
