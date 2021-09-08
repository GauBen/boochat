import type { PrismaClient, Team, User } from '@prisma/client'
import type { ValidateFunction } from 'ajv'
import type { JTDDataType } from 'ajv/dist/core'
import type Conf from 'conf'
import type { Server, Socket } from 'socket.io'
import type TypedEventEmitter from 'typed-emitter'
import EventEmitter from 'events'
import cors from 'cors'
import express, { json } from 'express'
import { nanoid } from 'nanoid'
import { GetRequest, Level, PostRequest, Response, schemas } from './api'
import {
  ClientToServerEvents,
  Room,
  ServerEvent,
  ServerToClientEvents,
} from './socket-api'

export interface AppAttributes {
  readonly io: Server<ClientToServerEvents, ServerToClientEvents>
  readonly prisma: PrismaClient
  readonly validate: {
    [k in keyof typeof schemas]: ValidateFunction<
      JTDDataType<typeof schemas[k]>
    >
  }
  readonly config: Conf<{ chat: { slowdown: number; moderationDelay: number } }>
}

export enum AppEvent {
  UserUpdated = 'user-updated',
}

export class App implements AppAttributes {
  readonly io
  readonly validate
  readonly prisma
  readonly config

  readonly api = express()
  readonly emitter: TypedEventEmitter<{
    [AppEvent.UserUpdated]: (user: User & { team: Team }) => void
  }> = new EventEmitter()

  readonly teams: Map<Team['id'], Team> = new Map()
  readonly users: Map<number, User & { team: Team }> = new Map()
  readonly tokens: Map<string, number> = new Map()

  constructor({ io, validate, prisma, config }: AppAttributes) {
    this.io = io
    this.validate = validate
    this.prisma = prisma
    this.config = config

    // Fetch data
    void prisma.team.findMany().then((teams) => {
      for (const team of teams) this.teams.set(team.id, team)
    })

    // Register middlewares
    this.api.use(json(), cors(), (req, _res, next) => {
      const { authorization: auth } = req.headers

      if (auth?.startsWith('Token ')) {
        const token = auth.slice(6)
        if (this.tokens.has(token))
          req.user = this.users.get(this.tokens.get(token) ?? -1)
      }

      next()
    })
    this.io.use(async (socket, next) => {
      const { token } = socket.handshake.auth
      socket.user = await this.getUserFromToken(token)
      next()
    })

    // Get requests
    this.get(GetRequest.Teams, () => [...this.teams.values()])
    this.get(GetRequest.UsersOnline, () => this.computeStats())

    // Post requests
    this.post(
      PostRequest.Me,
      async ({ token }) => (await this.getUserFromToken(token)) ?? false
    )

    this.post(PostRequest.Login, async ({ name, teamId }) => {
      const team = this.teams.get(teamId)

      if (!team || !team.pickable) throw new Error("Cette équipe n'existe pas")

      const found = await prisma.user.findUnique({ where: { name } })
      if (found) throw new Error('Ce compte existe déjà')

      const token = nanoid()
      const user = await prisma.user.create({
        data: { name, teamId, token },
        include: { team: true },
      })

      this.users.set(user.id, user)
      this.tokens.set(token, user.id)

      return { token }
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

  get<T extends GetRequest>(
    path: T,
    handler: () => Response[T] | Promise<Response[T]>
  ): void {
    this.api.get(path, async (_req, res) => {
      try {
        res.json(await handler())
      } catch (error: unknown) {
        console.error(error)
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Bad Request',
        })
      }
    })
  }

  post<T extends PostRequest>(
    path: T,
    handler: (
      body: JTDDataType<typeof schemas[T]>
    ) => Response[T] | Promise<Response[T]>
  ): void {
    this.api.post(path, async (req, res) => {
      if (!('body' in req) || !this.validate[path](req.body)) {
        res.status(400).json({ error: 'Invalid data' })
      } else {
        try {
          res.json(await handler(req.body as JTDDataType<typeof schemas[T]>))
        } catch (error: unknown) {
          console.error(error)
          res.status(400).json({
            error: error instanceof Error ? error.message : 'Bad Request',
          })
        }
      }
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
    const user = await this.prisma.user.findUnique({
      where: { token: `${token}` },
      include: { team: true },
    })
    if (!user) return undefined
    this.users.set(user.id, user)
    return user
  }
}

export type CreateSubApp = (app: App) => void
