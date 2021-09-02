import type { App } from '../app'
import type { Message, Team, User } from '@prisma/client'
import type { Socket } from 'socket.io'
import { GetRequest, Level } from '../api'
import { ClientEvent, Room, ServerEvent } from '../socket-api'

export default (app: App): void => {
  const { io, prisma } = app

  let messages: Array<
    Message & {
      author: User & {
        team: Team
      }
    }
  > = []

  void prisma.message
    .findMany({
      include: { author: { include: { team: true } } },
    })
    .then((res) => {
      messages = res
    })

  // Register a middleware to handle incoming socket events
  // eslint-disable-next-line sonarjs/cognitive-complexity
  io.use((socket: Socket, next) => {
    const { user } = socket

    socket.emit(ServerEvent.Connected)

    socket.on(ClientEvent.DeleteMessage, async (id: number) => {
      if (!user || user.level < 2) return
      io.emit(ServerEvent.DeleteMessage, id)
      messages = messages.filter((msg) => msg.id !== id)
      await prisma.message.update({
        data: { deleted: true },
        where: { id },
      })
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
          setTimeout(resolve, 5000)
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
        io.emit(ServerEvent.Message, { ...message, visible: true })
      }
    })

    next()
  })

  // Get the latest messages
  app.get(GetRequest.Messages, () =>
    messages.map((x) => ({ ...x, visible: true }))
  )
}
