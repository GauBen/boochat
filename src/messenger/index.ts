import type { App } from '../app'
import type { Message, Team, User } from '../types'
import type { Socket } from 'socket.io'
import { GetRequest, Level } from '../api'
import { ClientEvent, Room, ServerEvent } from '../socket-api'
import { Type } from './types'

export default (app: App): void => {
  const { io, prisma, config } = app

  let messages: Array<
    Message & {
      author: User & {
        team: Team
      }
    }
  > = []

  void prisma.message
    .findMany({
      take: -1000,
      include: { author: { include: { team: true } } },
      where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
    })
    .then((res) => {
      messages = res
    })

  // Register a middleware to handle incoming socket events
  // eslint-disable-next-line sonarjs/cognitive-complexity
  io.use((socket: Socket, next) => {
    const { user } = socket

    socket.emit(ServerEvent.Connected)

    const setDeleted = async (id: number, deleted: boolean): Promise<void> => {
      if (!user || user.level < Level.Moderator) return
      io.emit(
        deleted ? ServerEvent.DeleteMessage : ServerEvent.RestoreMessage,
        id
      )
      messages = messages.map((msg) =>
        msg.id === id ? { ...msg, deleted } : msg
      )
      await prisma.message.update({
        data: { deleted },
        where: { id },
      })
    }

    socket.on(ClientEvent.DeleteMessage, async (id: number) => {
      await setDeleted(id, true)
    })
    socket.on(ClientEvent.RestoreMessage, async (id: number) => {
      await setDeleted(id, false)
    })

    socket.on(ClientEvent.Message, async (msg: string) => {
      if (!user || user.level < 1) return

      msg = msg.slice(0, 150)

      const visible = user.level > Level.Chat

      const message = await prisma.message.create({
        data: {
          body: msg,
          authorId: user.id,
        },
        include: { author: { include: { team: true } } },
      })
      io.to(Room.Moderator).emit(ServerEvent.DetailedMessage, {
        ...message,
        visible,
      })

      if (!visible) {
        await new Promise((resolve) => {
          setTimeout(resolve, config.get('chat').moderationDelay)
        })
      }

      const send =
        visible ||
        !(
          await prisma.message.findUnique({
            where: { id: message.id },
          })
        )?.deleted

      if (send) {
        messages = [...messages.slice(-999), message]
        io.emit(ServerEvent.Message, {
          ...message,
          author: {
            id: user.id,
            name: user.name,
            teamId: user.teamId,
          },
          visible: true,
        })
      }
    })

    next()
  })

  // Get settings
  app.get(GetRequest.ChatSettings, () => config.get('chat'))

  // Get the latest messages
  app.get(GetRequest.Messages, () =>
    // Check user level
    true
      ? {
          type: Type.Detailed,
          messages: messages.map((message) => ({ ...message, visible: true })),
        }
      : {
          type: Type.Basic,
          messages: messages.map((x) => ({
            ...x,
            author: {
              id: x.author.id,
              name: x.author.name,
              teamId: x.author.teamId,
            },
            visible: true,
          })),
        }
  )
}
