import { fromToken } from '$lib/users-and-teams/users'
import type { RequestHandler } from '@sveltejs/kit'

export type GetMe = typeof fromToken

export const get: RequestHandler = async ({ url }) => {
  const token = url.searchParams.get('token')
  if (!token) return { status: 400 }
  try {
    return { body: await fromToken({ token }) }
  } catch {
    return { status: 404 }
  }
}
