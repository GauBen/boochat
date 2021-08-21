import { createServer } from 'http'
import polka from 'polka'
import { Server } from 'socket.io'
import sirv from 'sirv'
import { statSync } from 'fs'
import hat from 'hat'
import bodyParser from 'body-parser'
import cors from 'cors'

const { json } = bodyParser

const { PORT = 3001 } = process.env

const rack = hat.rack()
const tokens = new Map()

const server = createServer()
const polkaServer = polka({ server })

try {
  if (statSync('build').isDirectory()) {
    polkaServer.use(sirv('build'))
    console.log('Starting in production mode')
  }
} catch (err) {
  console.log('Starting in development mode')
}

polkaServer.use(json(), cors())
polkaServer.post('/api/login', (req, res) => {
  if (!('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }
  const token = rack()
  tokens.set(token, req.body.login)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ token }))
})

polkaServer.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})

const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth
  const login = tokens.get(token)
  if (!login) socket.disconnect(true)
  socket.on('chat message', (msg) => {
    io.emit('chat message', { login, msg })
  })
})
