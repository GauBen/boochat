import type { User } from './entities.js'
import { statSync } from 'fs'
import { createServer } from 'http'
import cors from 'cors'
import express, { json } from 'express'
import hat from 'hat'
import sirv from 'sirv'
import { Server } from 'socket.io'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'
// eslint-disable-next-line import/order,import/default
import pkg from '@prisma/client'

const { PrismaClient } = pkg

const PORT = 3001

const rack = hat.rack()
const tokens = new Map<string, User>()

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
  if (!req.body || typeof req.body !== 'object' || !('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  // TODO: check that login and color exists, and typed correctly
  const { login, teamId } = req.body as { login: string; teamId: number }
  const team = teams.find(({ id }) => id === teamId)

  if (!team) {
    res.status(400)
    return
  }

  const token = rack()
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
  const { token } = req.body as { token: string }
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
