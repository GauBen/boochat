import type { Message } from '@prisma/client'
import type { Server, Socket } from 'socket.io'
import express, { Express } from 'express'
// eslint-disable-next-line import/order,import/default
import pkg from '@prisma/client'
const { PrismaClient } = pkg

export default (
  io: Server
): {
  app: Express
  listen: (socket: Socket) => void
} => {
  const app = express()

  let messages: Message[] = []

  const prisma = new PrismaClient()
  void prisma.message
    .findMany({ include: { author: { include: { team: true } } } })
    .then((res) => {
      messages = res
    })

  app.get('/messages', (_req, res) => {
    res.json(messages)
  })

  const listen = (socket: Socket): void => {
    const { user } = socket
    if (!user) return

    socket.on('chat message', async (msg: string) => {
      const message = await prisma.message.create({
        data: {
          body: msg,
          authorId: user.id,
        },
        include: { author: { include: { team: true } } },
      })
      io.emit('chat message', message)
      messages = [...messages.slice(-999), message]
    })

    socket.on('del message', (id: number) => {
      io.emit('del message', id)
      messages = messages.filter((msg) => msg.id !== id)
    })
  }

  return { app, listen }
}
