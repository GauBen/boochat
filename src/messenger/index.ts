import type { Server, Socket } from 'socket.io'
import type { Message, UserEntity } from 'src/entities'
import express, { Express } from 'express'

export default (
  io: Server
): {
  app: Express
  listen: (socket: Socket, { login }: { login: UserEntity | undefined }) => void
} => {
  const app = express()

  let id = 1
  let messages: Message[] = []

  app.get('/messages', (_req, res) => {
    res.json(messages)
  })

  const listen = (
    socket: Socket,
    { login }: { login: UserEntity | undefined }
  ): void => {
    if (!login) return

    socket.on('chat message', (msg: string) => {
      const message = { login, msg, id: `${id++}` }
      io.emit('chat message', message)
      messages = [...messages.slice(-999), message]
    })

    socket.on('del message', (id: string) => {
      io.emit('del message', id)
      messages = messages.filter((msg) => msg.id !== id)
    })
  }

  return { app, listen }
}
