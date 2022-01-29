import { getTeams } from '$lib/users-and-teams/teams'
import type { RequestHandler } from '@sveltejs/kit'

export type GetTeams = typeof getTeams

export const get: RequestHandler = async () => ({
  body: await getTeams(),
})
