import { client } from '$lib/prisma'
import { Type } from '$messenger/types'
import type { RequestHandler } from '@sveltejs/kit'

export type GetResponse = {
  type: Type.Detailed
  messages: Array<{
    visible: true
    id: number
    authorId: number
    body: string
    gif: boolean
    deleted: boolean
    createdAt: Date
    author: {
      id: number
      name: string
      teamId: number
    }
  }>
}

export const get: RequestHandler = async () => ({
  body: {
    type: Type.Detailed,
    messages: (
      await client.message.findMany({
        take: -1000,
        include: { author: { select: { id: true, name: true, teamId: true } } },
      })
    )
      // eslint-disable-next-line unicorn/no-await-expression-member
      .map((message) => ({ ...message, visible: true })),
  },
})
