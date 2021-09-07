import type { App } from '../app'
import type { Message, Team, User } from '../types'
import type { Socket } from 'socket.io'
import { GetRequest, Level } from '../api'
import { AppEvent } from '../app'
import {
  ClientEvent,
  ClientToServerEvents,
  Room,
  ServerEvent,
  ServerToClientEvents,
} from '../socket-api'
import { Type } from './types'

export default (app: App): void => {
  const { io, prisma, config, emitter, users } = app

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

  const handleCommand = async (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    user: User,
    msg: string
  ) => {
    if (msg.startsWith('/ban ')) {
      let name = msg.slice(5)

      if (name.startsWith('@')) name = name.slice(1)

      const userFound = await prisma.user.findUnique({
        where: { name },
      })

      if (!userFound) {
        socket.emit(ServerEvent.Notice, 'Utilisateur inexistant')
        return
      }

      if (userFound.level >= user.level) {
        socket.emit(ServerEvent.Notice, 'Permissions insuffisantes')
        return
      }

      const updatedUser = await prisma.user.update({
        data: { level: Level.Banned },
        where: { id: userFound.id },
        include: { team: true },
      })
      users.set(updatedUser.id, updatedUser)

      emitter.emit(AppEvent.UserUpdated, updatedUser)
      io.to(Room.Moderator).emit(
        ServerEvent.Notice,
        `Utilisateur @${updatedUser.name} banni`
      )
    }
  }

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

    // eslint-disable-next-line complexity
    socket.on(ClientEvent.Message, async (msg: string) => {
      if (!user || user.level < 1) return

      msg = msg.slice(0, 150)
      if (msg.length <= 0) return
      if (msg.startsWith('/')) {
        await handleCommand(socket, user, msg)
        return
      }

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

      const deleted = (
        await prisma.message.findUnique({
          where: { id: message.id },
        })
      )?.deleted

      if (deleted === undefined) return

      messages = [...messages.slice(-999), message]
      io.emit(ServerEvent.Message, {
        ...message,
        deleted,
        author: {
          id: user.id,
          name: user.name,
          teamId: user.teamId,
        },
        visible: true,
      })
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
          messages: messages.map((message) => ({
            ...message,
            author: {
              id: message.author.id,
              name: message.author.name,
              teamId: message.author.teamId,
            },
            visible: true,
          })),
        }
  )
}
