import { statSync } from 'fs'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import cors from 'cors'
import hat from 'hat'
import polka from 'polka'
import sirv from 'sirv'
import { Server } from 'socket.io'

const { PORT = 3001 } = process.env

const rack = hat.rack()
const tokens = new Map<string, string>()

const server = createServer()
const polkaServer = polka({ server })

try {
  if (statSync('build').isDirectory()) {
    polkaServer.use(sirv('build'))
    console.log('Starting in production mode')
  }
} catch {
  console.log('Starting in development mode')
}

const api = polka()
// eslint-disable-next-line import/no-named-as-default-member
api.use(bodyParser.json(), cors())
api.post('/login', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !('login' in req.body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end('{}')
    return
  }

  const body = req.body as { login: string }

  const token = rack()
  tokens.set(token, body.login)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ token }))
})
polkaServer.use('/api', api)

polkaServer.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})

const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth
  const login = tokens.get(token)
  if (!login) socket.disconnect(true)
  socket.on('chat message', (msg: string) => {
    io.emit('chat message', { login, msg })
  })
})
