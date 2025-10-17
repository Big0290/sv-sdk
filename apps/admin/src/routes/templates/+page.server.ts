import type { PageServerLoad } from './$types';
import { db, emailTemplates } from '@sv-sdk/db-config';

export const load: PageServerLoad = async () => {
	const templates = await db.select().from(emailTemplates);

	return {
		templates
	};
};
