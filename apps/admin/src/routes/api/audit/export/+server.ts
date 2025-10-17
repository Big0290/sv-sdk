import type { RequestHandler } from './$types';
import { exportAuditLogsJSON, exportAuditLogsCSV } from '@sv-sdk/audit';
import { enforce } from '@sv-sdk/permissions';

export const GET: RequestHandler = async ({ locals, url }) => {
	// Enforce permission
	await enforce(locals.user!.id, 'read:any:audit_log');

	const format = url.searchParams.get('format') || 'json';

	let content: string;
	let contentType: string;
	let filename: string;

	if (format === 'csv') {
		content = await exportAuditLogsCSV({});
		contentType = 'text/csv';
		filename = `audit-logs-${Date.now()}.csv`;
	} else {
		content = await exportAuditLogsJSON({});
		contentType = 'application/json';
		filename = `audit-logs-${Date.now()}.json`;
	}

	return new Response(content, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
