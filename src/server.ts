import { schemas } from '$/api'
import { App } from '$/app'
import type { ClientToServerEvents, ServerToClientEvents } from '$/socket-api'
import createGame from '$games/connect3/index'
import { client } from '$lib/prisma'
import createMessenger from '$messenger/index'
import type { JTDDataType } from 'ajv/dist/jtd'
import Ajv from 'ajv/dist/jtd'
import type { ValidateFunction } from 'ajv/dist/types'
import chalk from 'chalk'
import Conf from 'conf'
import express, { RequestHandler } from 'express'
import { statSync } from 'fs'
import { createServer } from 'http'
import fetch from 'node-fetch'
import path from 'path'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'

const production = (() => {
  try {
    return statSync('build').isDirectory()
  } catch {
    return false
  }
})()

console.log(
  chalk.hex('#ff0')(`
 ___               _         _
| _ ) ___  ___  __| |_  __ _| |_
| _ \\/ _ \\/ _ \\/ _| ' \\/ _\` |  _|
|___/\\___/\\___/\\__|_||_\\__,_|\\__|
`) + `${(process.env.npm_package_version ?? 'unknown version').padStart(33)}\n`
)
// @ts-expect-error Add fetch to Node.js
globalThis.fetch = fetch

const ajv = new Ajv()

const port = Number(process.env.VITE_API_PORT ?? 3001)
const expressApp = express()
const server = createServer(expressApp)

const app = new App({
  io: new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
    serveClient: false,
  }),
  prisma: client,
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

if (production) {
  console.log('> Starting in production mode')
  // @ts-expect-error Import from a JS file cannot be typed
  import('../build/handler.js')
    .then(({ handler }: Record<string, RequestHandler>) => {
      expressApp.use(handler)
    })
    .catch((error) => {
      console.error(error)
    })
} else {
  console.log('> Starting in development mode')
}

server.listen(port, () => {
  console.log(`> Running on localhost:${port}`)
})
