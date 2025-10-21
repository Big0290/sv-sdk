import type { PageServerLoad } from './$types';
import { getRoles } from '@big0290/permissions';

export const load: PageServerLoad = async () => {
	const roles = await getRoles();

	return {
		roles
	};
};
