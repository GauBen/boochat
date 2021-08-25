import type { Server, Socket } from 'socket.io'
import type { User } from 'src/user'
import express, { Express } from 'express'

export default (
  io: Server
): {
  app: Express
  listen: (socket: Socket, { login }: { login: User | undefined }) => void
} => {
  const app = express()

  let id = 1
  let messages: Array<{ id: string; login: User; msg: string }> = []

  app.get('/messages', (_req, res) => {
    res.json(messages)
  })

  const listen = (
    socket: Socket,
    { login }: { login: User | undefined }
  ): void => {
    if (!login) return

    socket.on('chat message', (msg: string) => {
      const message = { login, msg, id: `${id++}` }
      io.emit('chat message', message)
      messages = [...messages.slice(-999), message]
    })

    socket.on('del message', (id: string) => {
      io.emit('del message', id)
    })
  }

  return { app, listen }
}
