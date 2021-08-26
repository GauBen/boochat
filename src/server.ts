import { statSync } from 'fs'
import { createServer } from 'http'
import cors from 'cors'
import express, { json } from 'express'
import hat from 'hat'
import sirv from 'sirv'
import { Server } from 'socket.io'
import { TeamEntity, UserEntity } from './entities.js'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'

const PORT = 3001

const rack = hat.rack()
const tokens = new Map<string, UserEntity>()

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: { origin: '*' },
  serveClient: false,
})
const teams = [
  new TeamEntity({ id: '1', name: 'SN', color: '#ff0000' }),
  new TeamEntity({ id: '2', name: 'EEEA', color: '#ffff00' }),
  new TeamEntity({ id: '3', name: 'Hydro', color: '#8080ff' }),
]
const messenger = createMessenger(io)
const quizz = createQuizz(io, teams)

const api = express()
api.use(json(), cors())
api.use(messenger.app)
api.use(quizz.app)
api.get('/teams', (_req, res) => {
  res.json(teams)
})

let userId = 1
api.post('/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  // TODO: check that login and color exists, and typed correctly
  const { login, teamId } = req.body as { login: string; teamId: string }
  const team = teams.find(({ id }) => id === teamId)

  if (!team) {
    res.status(400)
    return
  }

  const token = rack()
  tokens.set(token, new UserEntity({ id: `${userId++}`, name: login, team }))
  res.json({ token })
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
