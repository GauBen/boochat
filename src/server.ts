import Prisma from '@prisma/client'
import type { JTDDataType } from 'ajv/dist/jtd'
import Ajv from 'ajv/dist/jtd'
import type { ValidateFunction } from 'ajv/dist/types'
import Conf from 'conf'
import express from 'express'
import { statSync } from 'fs'
import { createServer } from 'http'
import fetch from 'node-fetch'
import path from 'path'
import sirv from 'sirv'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { schemas } from './api'
import { App } from './app'
import createGame from './games/connect3/index'
import createMessenger from './messenger/index'
import type { ClientToServerEvents, ServerToClientEvents } from './socket-api'

// @ts-expect-error Add fetch to Node.js
globalThis.fetch = fetch

const ajv = new Ajv()

// eslint-disable-next-line @typescript-eslint/naming-convention
const PORT = 3001
const expressApp = express()
const server = createServer(expressApp)

const app = new App({
  io: new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
    serveClient: false,
  }),
  prisma: new Prisma.PrismaClient(),
  validate: Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => [key, ajv.compile(schema)])
  ) as {
    [k in keyof typeof schemas]: ValidateFunction<
      JTDDataType<typeof schemas[k]>
    >
  },
  config: new Conf<{
    chat: { slowdown: number; moderationDelay: number }
    quizz: { question: number; answer: number; leaderboard: number }
  }>({
    cwd: path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'storage'
    ),
    configName: 'app-config',
    defaults: {
      chat: {
        moderationDelay: 2000,
        slowdown: 5000,
      },
      quizz: {
        question: 15_000,
        answer: 15_000,
        leaderboard: 15_000,
      },
    },
  }),
})

app.use(createMessenger, createGame)

expressApp.use('/api', app.api)

try {
  if (statSync('build').isDirectory()) {
    expressApp.use(sirv('build'))
    console.log('> Starting in production mode')
  }
} catch {
  console.log('> Starting in development mode')
}

server.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})
