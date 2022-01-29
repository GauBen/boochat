import { getMessages } from '$lib/messenger/messages'
import type { RequestHandler } from '@sveltejs/kit'

export type GetMessages = typeof getMessages

export const get: RequestHandler = async () => ({
  body: await getMessages(),
})
