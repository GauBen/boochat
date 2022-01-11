import { client } from '$lib/prisma'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async () => ({
  body: await client.message.findMany({ take: -1000 }),
})
