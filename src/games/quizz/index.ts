import type { Server, Socket } from 'socket.io'
import type { Team, UserEntity } from 'src/entities'
import express, { Express } from 'express'

export default (
  io: Server,
  teams: Team[]
): {
  app: Express
  listen: (socket: Socket, { login }: { login: UserEntity | undefined }) => void
} => {
  const app = express()

  const results = new Map<string, number>(teams.map(({ id }) => [id, 0]))
  let gameSettings: { value: string } = { value: 'Ca va ?' }

  app.get('/game-settings', (_req, res) => {
    res.json(gameSettings)
  })
  app.get('/game-results', (_req, res) => {
    res.json([...results.entries()])
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
    socket.on('game', () => {
      results.set(login.team.id, (results.get(login.team.id) ?? 0) + 1)
      io.emit('game', [...results.entries()])
    })
  }

  return { app, listen }
}
