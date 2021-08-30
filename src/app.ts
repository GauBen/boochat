import type { PrismaClient, Team, User } from '@prisma/client'
import type { ValidateFunction } from 'ajv'
import type { JTDDataType } from 'ajv/dist/core'
import type { Server } from 'socket.io'
import cors from 'cors'
import express, { Express, json } from 'express'
import { nanoid } from 'nanoid'
import { GetRequest, PostRequest, Response, schemas } from './api'
import {
  ClientToServerEvents,
  ServerEvent,
  ServerToClientEvents,
} from './socket-api'
export interface AppAttributes {
  readonly io: Server<ClientToServerEvents, ServerToClientEvents>
  readonly validate: {
    [k in keyof typeof schemas]: ValidateFunction<
      JTDDataType<typeof schemas[k]>
    >
  }

  readonly prisma: PrismaClient
}

export class App implements AppAttributes {
  readonly io
  readonly validate
  readonly prisma
  readonly api: Express

  teams: Team[] = []
  tokens: Map<string, User & { team: Team }>
  subapps: CreateSubApp[] = []

  constructor({ io, validate, prisma }: AppAttributes) {
    this.api = express()
    this.io = io
    this.validate = validate
    this.prisma = prisma

    void prisma.team.findMany().then((teams) => {
      this.teams = teams
    })
    this.tokens = new Map<string, User & { team: Team }>()

    this.io.on('connection', (socket) => {
      if (!socket.user) socket.emit(ServerEvent.LoggedOut)
    })
    this.api.use(json(), cors(), (req, _res, next) => {
      const { authorization: auth } = req.headers

      if (auth?.startsWith('Token ')) {
        const token = auth.slice(6)
        if (this.tokens.has(token)) req.user = this.tokens.get(token)
      }

      next()
    })

    this.get(GetRequest.Teams, () => this.teams)

    this.post(PostRequest.Login, async ({ login, teamId }) => {
      const team = this.teams.find(({ id }) => id === teamId)

      if (!team) throw new Error("Cette équipe n'existe pas")

      const user = await prisma.user.findUnique({
        where: { name: login },
        include: { team: true },
      })

      const token = nanoid()

      this.tokens.set(
        token,
        user
          ? await prisma.user.update({
              where: { id: user.id },
              data: { teamId },
              include: { team: true },
            })
          : await prisma.user.create({
              data: { name: login, teamId },
              include: { team: true },
            })
      )

      return { token }
    })

    this.post(PostRequest.Token, ({ token }) => this.tokens.has(token))

    io.use((socket, next) => {
      const { token } = socket.handshake.auth
      socket.user = this.tokens.get(token)
      next()
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

  get<T extends GetRequest>(
    path: T,
    handler: () => Response[T] | Promise<Response[T]>
  ): void {
    this.api.get(path, async (_req, res) => {
      res.json(await handler())
    })
  }

  use(...subapps: CreateSubApp[]): void {
    this.subapps = [...this.subapps, ...subapps]
    for (const subapp of subapps) subapp(this)
  }
}

export type CreateSubApp = (app: App) => void
