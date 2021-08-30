import type { JTDDataType } from 'ajv/dist/jtd'
import type { ValidateFunction } from 'ajv/dist/types'
import { statSync } from 'fs'
import { createServer } from 'http'
// eslint-disable-next-line import/default
import pkg, { Team, User } from '@prisma/client'
import Ajv from 'ajv/dist/jtd.js'
import cors from 'cors'
import express, { Express, json } from 'express'
import { nanoid } from 'nanoid'
import sirv from 'sirv'
import { Server, Socket } from 'socket.io'
import { PostRequest, Response, schemas } from './api.js'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'

const { PrismaClient } = pkg

const ajv = new Ajv()
const validate = Object.fromEntries(
  Object.entries(schemas).map(([key, schema]) => [key, ajv.compile(schema)])
) as {
  [k in keyof typeof schemas]: ValidateFunction<JTDDataType<typeof schemas[k]>>
}

const PORT = 3001

const tokens = new Map<string, User & { team: Team }>()

const app = express()
const server = createServer(app)

const io = new Server<Record<string, never>, { 'logged out': () => void }>(
  server,
  {
    cors: { origin: '*' },
    serveClient: false,
  }
)

const prisma = new PrismaClient()

const teams = await prisma.team.findMany()

const loadSocket = (socket: Socket) => {
  socket.removeAllListeners()
  messenger.listen(socket)
  quizz.listen(socket)
}

const messenger = createMessenger(io, loadSocket)
const quizz = createQuizz(io, teams)

const api = express()
api.use(json(), cors(), (req, _res, next) => {
  const { authorization: auth } = req.headers

  if (auth?.startsWith('Token ')) {
    const token = auth.slice(6)
    if (tokens.has(token)) req.user = tokens.get(token)
  }

  next()
})

api.use(messenger.app)
api.use(quizz.app)
api.get('/teams', (_req, res) => {
  res.json(teams)
})

const post = <T extends PostRequest>(
  app: Express,
  path: T,
  handler: (
    body: JTDDataType<typeof schemas[T]>
  ) => Response[T] | Promise<Response[T]>
) => {
  app.post(path, async (req, res) => {
    if (!('body' in req) || !validate[path](req.body)) {
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

post(api, PostRequest.Login, async ({ login, teamId }) => {
  const team = teams.find(({ id }) => id === teamId)

  if (!team) throw new Error("Cette équipe n'existe pas")

  const user = await prisma.user.findUnique({
    where: { name: login },
    include: { team: true },
  })

  const token = nanoid()

  if (user) {
    tokens.set(
      token,
      await prisma.user.update({
        where: { id: user.id },
        data: { teamId },
        include: { team: true },
      })
    )
  } else {
    tokens.set(
      token,
      await prisma.user.create({
        data: { name: login, teamId },
        include: { team: true },
      })
    )
  }

  return { token }
})

post(api, PostRequest.Token, ({ token }) => tokens.has(token))

io.use((socket, next) => {
  const { token } = socket.handshake.auth
  socket.user = tokens.get(token)
  next()
})

io.on('connection', (socket) => {
  if (!socket.user) socket.emit('logged out')
  loadSocket(socket)
})

app.use('/api', api)

try {
  if (statSync('build').isDirectory()) {
    app.use(sirv('build'))
    console.log('Starting in production mode')
  }
} catch {
  console.log('Starting in development mode')
}

server.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})
