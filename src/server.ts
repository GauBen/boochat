import { statSync } from 'fs'
import { createServer } from 'http'
import cors from 'cors'
import express from 'express'
import hat from 'hat'
import sirv from 'sirv'
import { Server } from 'socket.io'
import { User } from './user.js'

const { PORT = 3001 } = process.env

const rack = hat.rack()
const tokens = new Map<string, User>()

const app = express()
const server = createServer(app)

try {
  if (statSync('build').isDirectory()) {
    app.use(sirv('build'))
    console.log('Starting in production mode')
  }
} catch {
  console.log('Starting in development mode')
}

const api = express()
// eslint-disable-next-line import/no-named-as-default-member
api.use(express.json(), cors())
api.post('/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  // TODO: check that login and color exists, and typed correctly
  const body = req.body as { login: string; color?: string }

  let { login, color } = body

  color = color?.match('#[a-fA-F0-9]{6}') ? color : undefined

  const token = rack()
  tokens.set(token, new User({ name: login, color }))
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ token }))
})
app.use('/api', api)

const io = new Server(server, { cors: { origin: '*' } })

let id = 1

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth
  const login = tokens.get(token)

  if (!login) {
    socket.disconnect(true)
    return
  }

  socket.on('chat message', (msg: string) => {
    io.emit('chat message', { login, msg, id: `${id++}` })
  })
  socket.on('del message', (id: string) => {
    io.emit('del message', id)
  })
})

server.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})
