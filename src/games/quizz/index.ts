import type { Team } from '@prisma/client'
import type { Server, Socket } from 'socket.io'
import express, { Express } from 'express'

export default (
  io: Server,
  teams: Team[]
): {
  app: Express
  listen: (socket: Socket) => void
} => {
  const app = express()

  const results = new Map<number, number>(teams.map(({ id }) => [id, 0]))
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

  const listen = (socket: Socket): void => {
    const { user } = socket
    if (!user) return
    socket.on('game', () => {
      results.set(user.team.id, (results.get(user.team.id) ?? 0) + 1)
      io.emit('game', [...results.entries()])
    })
  }

  return { app, listen }
}
