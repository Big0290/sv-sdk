import type { PageServerLoad } from './$types';
import { getRoles, getUsersWithRole } from '@big0290/permissions';

export const load: PageServerLoad = async () => {
	const roles = await getRoles();

	// Get user count for each role
	const rolesWithCount = await Promise.all(
		roles.map(async (role) => {
			const users = await getUsersWithRole(role.id);
			return {
				...role,
				userCount: users.length
			};
		})
	);

	return {
		roles: rolesWithCount
	};
};
