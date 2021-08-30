import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket-api.js'
import type { JTDDataType } from 'ajv/dist/jtd'
import type { ValidateFunction } from 'ajv/dist/types'
import { statSync } from 'fs'
import { createServer } from 'http'
// eslint-disable-next-line import/default
import pkg from '@prisma/client'
import Ajv from 'ajv/dist/jtd.js'
import express from 'express'
import sirv from 'sirv'
import { Server } from 'socket.io'
import { schemas } from './api.js'
import { App } from './app.js'
import createQuizz from './games/quizz/index.js'
import createMessenger from './messenger/index.js'

const { PrismaClient } = pkg
const ajv = new Ajv()

const PORT = 3001
const expressApp = express()
const server = createServer(expressApp)

const app = new App({
  io: new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
    serveClient: false,
  }),
  prisma: new PrismaClient(),
  validate: Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => [key, ajv.compile(schema)])
  ) as {
    [k in keyof typeof schemas]: ValidateFunction<
      JTDDataType<typeof schemas[k]>
    >
  },
})

app.use(createMessenger, createQuizz)

expressApp.use('/api', app.api)

try {
  if (statSync('build').isDirectory()) {
    expressApp.use(sirv('build'))
    console.log('Starting in production mode')
  }
} catch {
  console.log('Starting in development mode')
}

server.listen(PORT, () => {
  console.log(`> Running on localhost:${PORT}`)
})
