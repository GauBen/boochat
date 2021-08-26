import type { Server, Socket } from 'socket.io'
import type { UserEntity } from 'src/entities'
import express, { Express } from 'express'

export default (
  io: Server
): {
  app: Express
  listen: (socket: Socket, { login }: { login: UserEntity | undefined }) => void
} => {
  const app = express()

  let gameSettings: { value: string; n: number } = { value: 'Ca va ?', n: 4 }
  app.get('/game-settings', (_req, res) => {
    res.json(gameSettings)
  })
  app.post('/setup-game', (req, res) => {
    gameSettings = req.body as typeof gameSettings
    io.emit('game-settings', gameSettings)
    res.end()
  })

  const listen = (
    socket: Socket,
    { login }: { login: UserEntity | undefined }
  ): void => {
    if (!login) return
    socket.on('game', (evt: string) => {
      io.emit('game', evt)
    })
  }

  return { app, listen }
}
