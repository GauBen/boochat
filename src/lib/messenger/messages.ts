import { prisma } from '$lib/prisma'
import { Type } from '$messenger/types'

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

export const getMessages = async (): Promise<GetResponse> => ({
  type: Type.Detailed,
  messages: (
    await prisma.message.findMany({
      take: -1000,
      include: { author: { select: { id: true, name: true, teamId: true } } },
    })
  )
    // eslint-disable-next-line unicorn/no-await-expression-member
    .map((message) => ({ ...message, visible: true })),
})
