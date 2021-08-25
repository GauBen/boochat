import { statSync } from 'fs'
import { createServer } from 'http'
import cors from 'cors'
import express, { json } from 'express'
import hat from 'hat'
import sirv from 'sirv'
import { Server } from 'socket.io'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'
import { User } from './user.js'

const PORT = 3001

const rack = hat.rack()
const tokens = new Map<string, User>()

const app = express()
const server = createServer(app)

const io = new Server(server, { cors: { origin: '*' } })
const messenger = createMessenger(io)
const quizz = createQuizz(io)

const api = express()
api.use(json(), cors())
api.use(messenger.app)
api.use(quizz.app)
api.post('/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  // TODO: check that login and color exists, and typed correctly
  let { login, color } = req.body as { login: string; color?: string }

  color = color?.match('#[a-fA-F0-9]{6}') ? color : undefined

  const token = rack()
  tokens.set(token, new User({ name: login, color }))
  res.json({ token })
})

api.post('/is-logged-in', (req, res) => {
  const { token } = req.body as { token: string }
  res.json(tokens.has(token))
})

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth
  const login = tokens.get(token)

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
