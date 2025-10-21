import type { Handle } from '@sveltejs/kit'
import { auth } from '@big0290/auth'

export const handle: Handle = async ({ event, resolve }) => {
  // Get session from BetterAuth
  const session = await auth.api.getSession({ headers: event.request.headers })

  // Attach user to event.locals
  event.locals.user = session?.user || null
  event.locals.session = session || null

  return resolve(event)
}
