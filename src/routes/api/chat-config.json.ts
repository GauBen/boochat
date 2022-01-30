import { config } from '$lib/config'
import type { RequestHandler } from '@sveltejs/kit'

export type GetChatConfig = () => { slowdown: number; moderationDelay: number }

export const get: RequestHandler = () => ({ body: config.get('chat') })
