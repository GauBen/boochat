import { Level } from '$/api'
import { prisma } from '$lib/prisma'
import type { Team, User } from '@prisma/client'
import EventEmitter from 'events'
import type { Server, Socket } from 'socket.io'
import type TypedEventEmitter from 'typed-emitter'
import {
  ClientToServerEvents,
  Room,
  ServerEvent,
  ServerToClientEvents,
} from './socket-api'

export interface AppAttributes {
  readonly io: Server<ClientToServerEvents, ServerToClientEvents>
}

export enum AppEvent {
  UserUpdated = 'user-updated',
}

export class App implements AppAttributes {
  readonly io
  readonly loaded

  readonly emitter = new EventEmitter() as TypedEventEmitter<{
    [AppEvent.UserUpdated]: (user: User & { team: Team }) => void
  }>

  readonly teams: Map<Team['id'], Team> = new Map()
  readonly users: Map<number, User & { team: Team }> = new Map()
  readonly tokens: Map<string, number> = new Map()

  constructor({ io }: AppAttributes) {
    this.io = io

    let markAsLoaded: (_: void | PromiseLike<void>) => void
    this.loaded = new Promise<void>((resolve) => {
      markAsLoaded = resolve
    })

    // Fetch data
    void prisma.team.findMany().then((teams) => {
      for (const team of teams) this.teams.set(team.id, team)
      markAsLoaded()
    })

    // Register middlewares
    this.io.use(async (socket, next) => {
      const { token } = socket.handshake.auth
      socket.user = await this.getUserFromToken(token)
      next()
    })

    // Socket events
    this.io.on('connect', (socket) => {
      if (socket.user) this.emitter.emit(AppEvent.UserUpdated, socket.user)
      else socket.emit(ServerEvent.LoggedOut)

      io.to(Room.Moderator).emit(ServerEvent.Stats, this.computeStats())
      socket.on('disconnect', () => {
        io.to(Room.Moderator).emit(ServerEvent.Stats, this.computeStats())
      })
    })

    // Listen for user updates
    this.emitter.on(AppEvent.UserUpdated, (user) => {
      for (const socket of this.getUserSockets(user)) {
        socket.user = user
        void socket.join(Room.Chat)

        if (user.level >= Level.Moderator) void socket.join(Room.Moderator)
        else void socket.leave(Room.Moderator)

        if (user.level >= Level.Admin) void socket.join(Room.Admin)
        else void socket.leave(Room.Admin)

        socket.emit(ServerEvent.UserUpdated, user)
      }

      io.to(Room.Moderator).emit(ServerEvent.Stats, this.computeStats())
    })
  }

  use(...subapps: CreateSubApp[]): void {
    for (const subapp of subapps) subapp(this)
  }

  computeStats(): {
    online: number
    connected: number
    users: Array<{
      user: User & {
        team: Team
      }
      online: number
    }>
  } {
    let online = 0
    let connected = 0
    const users = new Map<User['id'], number>()

    for (const socket of this.io.sockets.sockets.values()) {
      online++
      if (!socket.user) continue
      connected++
      users.set(socket.user.id, (users.get(socket.user.id) ?? 0) + 1)
    }

    return {
      online,
      connected,
      users: [...users.entries()].map(([id, online]) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        user: this.users.get(id)!,
        online,
      })),
    }
  }

  getUserSockets({
    id,
  }: {
    id: User['id']
  }): Array<Socket<ClientToServerEvents, ServerToClientEvents>> {
    return [...this.io.sockets.sockets.values()].filter(
      ({ user }) => user && user.id === id
    )
  }

  async getUserFromToken(
    token: string
  ): Promise<(User & { team: Team }) | undefined> {
    const cache = this.users.get(this.tokens.get(token) ?? -1)
    if (cache) return cache
    const user = await prisma.user.findUnique({
      where: { token: `${token}` },
      include: { team: true },
    })
    if (!user) return undefined
    this.users.set(user.id, user)
    return user
  }
}

export type CreateSubApp = (app: App) => void
