import type { PageServerLoad } from './$types';
import { getUsers } from '@big0290/auth';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || undefined;

	const users = await getUsers({ search }, { page, pageSize: 20 });

	return {
		users
	};
};
