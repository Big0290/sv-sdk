import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkSystemHealth } from '@sv-sdk/core';

export const GET: RequestHandler = async () => {
	const health = await checkSystemHealth();

	return json(health, {
		status: health.healthy ? 200 : 503
	});
};
