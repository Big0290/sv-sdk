import type { PageServerLoad } from './$types';
import { fetchAuditLogs } from '@sv-sdk/audit';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const eventType = url.searchParams.get('eventType') || undefined;
	const userId = url.searchParams.get('userId') || undefined;

	const logs = await fetchAuditLogs({ eventType, userId }, { page, pageSize: 50 });

	return {
		logs
	};
};
