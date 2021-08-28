import { statSync } from 'fs'
import { createServer } from 'http'
// eslint-disable-next-line import/default
import pkg, { User, Team } from '@prisma/client'
import Ajv from 'ajv/dist/jtd.js'
import cors from 'cors'
import express, { json } from 'express'
import { nanoid } from 'nanoid'
import sirv from 'sirv'
import { Server } from 'socket.io'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'

const ajv = new Ajv()

const schemaLogin = {
  properties: {
    teamId: { type: 'int32' },
    login: { type: 'string' },
  },
} as const
const validateLogin = ajv.compile(schemaLogin)

const schemaToken = {
  properties: {
    token: { type: 'string' },
  },
} as const
const validateToken = ajv.compile(schemaToken)

const { PrismaClient } = pkg

const PORT = 3001

const tokens = new Map<string, User & { team: Team }>()

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: { origin: '*' },
  serveClient: false,
})

const prisma = new PrismaClient()

const teams = await prisma.team.findMany()

const messenger = createMessenger(io)
const quizz = createQuizz(io, teams)

const api = express()
api.use(json(), cors())
api.use(messenger.app)
api.use(quizz.app)
api.get('/teams', (_req, res) => {
  res.json(teams)
})

api.post('/login', async (req, res) => {
  if (!validateLogin(req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  const { login, teamId } = req.body
  const team = teams.find(({ id }) => id === teamId)

  if (!team) {
    res.status(400)
    return
  }

  const token = nanoid()
  try {
    tokens.set(
      token,
      await prisma.user.create({
        data: { name: login, teamId },
        include: { team: true },
      })
    )
    res.json({ token })
  } catch {
    res.status(400).json({ error: 'Nom déjà enregistré' })
  }
})

api.post('/is-logged-in', (req, res) => {
  if (!validateToken(req.body)) {
    res.status(400)
    return
  }

  const { token } = req.body
  res.json(tokens.has(token))
})

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth
  const login = tokens.get(token)

  if (token && !login) socket.emit('logged out')

  messenger.listen(socket, { login })
  quizz.listen(socket, { login })
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
