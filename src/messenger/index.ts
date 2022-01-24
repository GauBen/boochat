import { GetRequest, Level } from '$/api'
import type { App } from '$/app'
import { AppEvent } from '$/app'
import { check } from 'p4ssw0rd'
import type { Socket } from 'socket.io'
import { gifDetails } from 'svelte-tenor/api'
import {
  ClientEvent,
  ClientToServerEvents,
  Room,
  ServerEvent,
  ServerToClientEvents,
} from '../socket-api'
import type { Team, User } from '../types'

export default (app: App): void => {
  const { io, prisma, config, emitter, users } = app

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

      const dbMessage = await prisma.message.findUnique({
        where: { id: message.id },
      })
      const deleted = dbMessage?.deleted

      if (deleted === undefined) return

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

      const details = await gifDetails({
        ids: [msg.slice(0, 30)],
        key: '9HGV6JC47G6A',
      })
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

      // TODO dedupe
      const dbMessage = await prisma.message.findUnique({
        where: { id: message.id },
      })
      const deleted = dbMessage?.deleted

      if (deleted === undefined) return

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
}
