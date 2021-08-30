import type { App } from '../app'
import type { Socket } from 'socket.io'
import { GetRequest, RichMessage } from '../api'
import { ClientEvent, ServerEvent } from '../socket-api'

export default (app: App): void => {
  let messages: RichMessage[] = []

  void app.prisma.message
    .findMany({ include: { author: { include: { team: true } } } })
    .then((res) => {
      messages = res
    })

  app.get(GetRequest.Messages, () => messages)

  app.io.use((socket: Socket, next) => {
    const { user } = socket
    if (!user) return

    socket.on(ClientEvent.DeleteMessage, (id: number) => {
      app.io.emit(ServerEvent.DeleteMessage, id)
      messages = messages.filter((msg) => msg.id !== id)
    })
    socket.on(ClientEvent.Message, async (msg: string) => {
      if (user.level < 1) return

      if (msg === 'banme') {
        user.level = 0
        await app.prisma.user.update({
          data: { level: 0 },
          where: { id: user.id },
        })
      }

      const message = await app.prisma.message.create({
        data: {
          body: msg,
          authorId: user.id,
        },
        include: { author: { include: { team: true } } },
      })
      app.io.emit(ServerEvent.Message, message)
      messages = [...messages.slice(-999), message]
    })

    next()
  })
}
