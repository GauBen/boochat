import { client } from '$lib/prisma'
import type { Team } from '@prisma/client'
import type { RequestHandler } from '@sveltejs/kit'

export type GetResponse = Team[]

export const get: RequestHandler = async (): Promise<{
  body: GetResponse
}> => ({
  body: await client.team.findMany(),
})
