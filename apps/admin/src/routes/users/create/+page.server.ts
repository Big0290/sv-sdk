import type { PageServerLoad } from './$types'
import { getRoles } from '@sv-sdk/permissions'

export const load: PageServerLoad = async () => {
  const roles = await getRoles()

  return {
    roles,
  }
}

