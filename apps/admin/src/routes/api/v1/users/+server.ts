import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsers, createUser } from '@big0290/auth';
import { enforce } from '@big0290/permissions';
import { validateRequest } from '@big0290/validators';
import { signupRequestSchema } from '@big0290/validators';

/**
 * GET /api/v1/users
 * List all users
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	// Enforce permission
	await enforce(locals.user!.id, 'read:any:user');

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
	const search = url.searchParams.get('search') || undefined;
	const role = url.searchParams.get('role') || undefined;

	const result = await getUsers({ search, role }, { page, pageSize });

	return json({
		success: true,
		data: result.data,
		pagination: result.pagination
	});
};

/**
 * POST /api/v1/users
 * Create new user
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	// Enforce permission
	await enforce(locals.user!.id, 'create:any:user');

	const body = await request.json();

	// Validate request
	const validation = validateRequest(signupRequestSchema, body);

	if (!validation.success) {
		return json(
			{
				success: false,
				error: 'Validation failed',
				details: validation.errors
			},
			{ status: 400 }
		);
	}

	// Create user
	const user = await createUser({
		email: body.email,
		name: body.name,
		role: body.role || 'user',
		emailVerified: false,
		isActive: true
	});

	return json(
		{
			success: true,
			data: user
		},
		{ status: 201 }
	);
};
