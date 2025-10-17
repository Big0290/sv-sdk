import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { signup } from '@sv-sdk/auth'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const body = await request.json()

    const result = await signup(body, {
      ipAddress: getClientAddress(),
    })

    if (!result.success) {
      return json({ error: result.error.message }, { status: 400 })
    }

    return json({
      success: true,
      user: result.data.user,
    })
  } catch (error) {
    return json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
}

