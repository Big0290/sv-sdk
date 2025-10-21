/**
 * Server hooks for admin application
 * Handles authentication, authorization, and security
 */

import type { Handle } from '@sveltejs/kit';
import { auth } from '@big0290/auth';
import { checkRoutePermission } from '@big0290/permissions';
import { rateLimiter } from '@big0290/security';
import { logAudit } from '@big0290/audit';
import { logger } from '@big0290/shared';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const ipAddress = event.getClientAddress();

	// Get session from BetterAuth
	const session = await auth.api.getSession({ headers: event.request.headers });

	// Attach user to event.locals
	event.locals.user = session?.user || null;
	event.locals.session = session || null;

	// Rate limiting on API endpoints
	if (pathname.startsWith('/api/')) {
		const rateLimitKey = session?.user?.id || ipAddress;
		const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, {
			max: 100,
			windowMs: 15 * 60 * 1000 // 15 minutes
		});

		if (!rateLimitResult.allowed) {
			logger.warn('Rate limit exceeded', { user: session?.user?.email, ipAddress, pathname });

			return new Response('Too many requests', {
				status: 429,
				headers: {
					'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000))
				}
			});
		}
	}

	// Public routes (no auth required)
	const publicRoutes = ['/login', '/health', '/api/health'];

	if (publicRoutes.some((route) => pathname.startsWith(route))) {
		return resolve(event);
	}

	// Require authentication for all other routes
	if (!session?.user) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Redirect to login for page routes
		return new Response(null, {
			status: 302,
			headers: {
				location: `/login?redirect=${encodeURIComponent(pathname)}`
			}
		});
	}

	// Check permissions for protected routes
	const routeCheck = await checkRoutePermission(session.user.id, pathname);

	if (!routeCheck.allowed) {
		// Log unauthorized access attempt
		await logAudit('admin.unauthorized_access', {
			userId: session.user.id,
			pathname,
			ipAddress
		});

		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Redirect to forbidden page
		return new Response(null, {
			status: 302,
			headers: { location: '/forbidden' }
		});
	}

	// Log admin action for audit trail
	if (event.request.method !== 'GET') {
		await logAudit('admin.action', {
			userId: session.user.id,
			action: event.request.method,
			pathname,
			ipAddress
		});
	}

	return resolve(event);
};
