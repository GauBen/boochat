import type { App } from '../app'
import type { Message, Team, User } from '../types'
import type { Socket } from 'socket.io'
import { check } from 'p4ssw0rd'
import { gifs } from 'svelte-tenor/api'
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

  const changeLevel = async (
    moderator: User,
    name: string,
    level: Level
  ): Promise<User & { team: Team }> => {
    if (name.startsWith('@')) name = name.slice(1)

    const userFound = await prisma.user.findUnique({
      where: { name },
    })

    if (!userFound) throw new Error('Utilisateur inexistant')

    if (userFound.level >= moderator.level || moderator.level < Level.Moderator)
      throw new Error('Permissions insuffisantes')

    const updatedUser = await prisma.user.update({
      data: { level },
      where: { id: userFound.id },
      include: { team: true },
    })
    users.set(updatedUser.id, updatedUser)
    return updatedUser
  }

  // eslint-disable-next-line complexity
  const handleCommand = async (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    user: User,
    msg: string
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ) => {
    try {
      if (msg.startsWith('/ban ')) {
        const updatedUser = await changeLevel(user, msg.slice(5), Level.Banned)
        emitter.emit(AppEvent.UserUpdated, updatedUser)
        io.to(Room.Moderator).emit(
          ServerEvent.Notice,
          `Utilisateur @${updatedUser.name} banni`
        )
      } else if (msg.startsWith('/reset ')) {
        const updatedUser = await changeLevel(user, msg.slice(7), Level.Chat)
        emitter.emit(AppEvent.UserUpdated, updatedUser)
        io.to(Room.Moderator).emit(
          ServerEvent.Notice,
          `Utilisateur @${updatedUser.name} réinitialisé`
        )
      } else if (msg.startsWith('/mod ')) {
        const updatedUser = await changeLevel(
          user,
          msg.slice(5),
          Level.Moderator
        )
        emitter.emit(AppEvent.UserUpdated, updatedUser)
        io.to(Room.Moderator).emit(
          ServerEvent.Notice,
          `Utilisateur @${updatedUser.name} modérateur`
        )
      } else if (msg.startsWith('/admin ')) {
        const password = msg.slice(7)
        if (
          !check(
            password,
            '$2a$10$XWqKp3l/DSmiRlmEMTCoGuEln98rCQzz.Loq/vJK58WJVpn0Q8nS.'
          )
        )
          throw new Error('Mauvais mot de passe')

        const updatedUser = await prisma.user.update({
          data: { level: Level.Admin },
          where: { id: user.id },
          include: { team: true },
        })
        users.set(updatedUser.id, updatedUser)
        emitter.emit(AppEvent.UserUpdated, updatedUser)
        socket.emit(ServerEvent.Notice, `Connecté en tant qu'administrateur`)
      }
    } catch (error: unknown) {
      if (error instanceof Error) socket.emit(ServerEvent.Notice, error.message)
    }
  }

  // Register a middleware to handle incoming socket events
  // eslint-disable-next-line sonarjs/cognitive-complexity
  io.use((socket: Socket, next) => {
    const { user } = socket

    socket.emit(ServerEvent.Connected)

    // eslint-disable-next-line complexity
    const setDeleted = async (id: number, deleted: boolean): Promise<void> => {
      if (!user || user.level < Level.Moderator) return
      const message = await prisma.message.findUnique({
        where: { id },
        include: { author: true },
      })
      if (
        !message ||
        (message.author.level >= user.level && message.author.id !== user.id)
      )
        return
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
      await setDeleted(Number(id), true)
    })
    socket.on(ClientEvent.RestoreMessage, async (id: number) => {
      await setDeleted(Number(id), false)
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

    // eslint-disable-next-line complexity
    socket.on(ClientEvent.Gif, async (msg: string) => {
      if (!user || user.level < 1) return

      const ids = msg.slice(0, 30)
      const details = await gifs({ ids, key: '9HGV6JC47G6A' })
      if (!details?.results?.length || details.results.length === 0) return
      const gif = details.results[0]

      const visible = user.level > Level.Chat

      const message = await prisma.message.create({
        data: {
          body: JSON.stringify(gif),
          gif: true,
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
    // TODO Check user level
    // eslint-disable-next-line no-constant-condition
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
