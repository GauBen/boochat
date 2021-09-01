import type { App } from '../app'
import type { Socket } from 'socket.io'
import { GetRequest, RichMessage } from '../api'
import { ClientEvent, ServerEvent } from '../socket-api'

export default (app: App): void => {
  const { io, prisma } = app

  let messages: RichMessage[] = []

  void prisma.message
    .findMany({ include: { author: { include: { team: true } } } })
    .then((res) => {
      messages = res
    })

  // Register a middleware to handle incoming socket events
  io.use((socket: Socket, next) => {
    const { user } = socket

    socket.emit(ServerEvent.Connected)

    socket.on(ClientEvent.DeleteMessage, (id: number) => {
      io.emit(ServerEvent.DeleteMessage, id)
      messages = messages.filter((msg) => msg.id !== id)
    })
    socket.on(ClientEvent.Message, async (msg: string) => {
      if (!user || user.level < 1) return

      if (msg === 'banme') {
        user.level = 0
        await prisma.user.update({
          data: { level: 0 },
          where: { id: user.id },
        })
      }

      const message = await prisma.message.create({
        data: {
          body: msg,
          authorId: user.id,
        },
        include: { author: { include: { team: true } } },
      })
      io.emit(ServerEvent.Message, message)
      messages = [...messages.slice(-999), message]
    })

    next()
  })

  // Get the latest messages
  app.get(GetRequest.Messages, () => messages)
}
