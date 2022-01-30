import { schemas } from '$/api'
import { App } from '$/app'
import type { ClientToServerEvents, ServerToClientEvents } from '$/socket-api'
import createGame from '$games/connect3'
import { config } from '$lib/config'
import { client as prisma } from '$lib/prisma'
import createMessenger from '$messenger'
import type { JTDDataType } from 'ajv/dist/jtd'
import Ajv from 'ajv/dist/jtd'
import type { ValidateFunction } from 'ajv/dist/types'
import chalk from 'chalk'
import debug from 'debug'
import express, { RequestHandler } from 'express'
import { statSync } from 'fs'
import { createServer } from 'http'
import fetch from 'node-fetch'
import { Server } from 'socket.io'

const log = debug('boochat')

// @ts-expect-error Monkey patch to add fetch to Node.js
globalThis.fetch = fetch

// Server settings
const port = Number(process.env.VITE_API_PORT ?? 3001)
const version = String(process.env.npm_package_version ?? 'unknown version')
const isProduction = (() => {
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
|___/\\___/\\___/\\__|_||_\\__,_|\\__|`)
)
console.log(version.padStart(33))
console.log()
console.log(`Set ${chalk.blue('DEBUG=boochat*')} to see log messages`)
console.log(
  `Starting in ${
    isProduction
      ? chalk.redBright('production')
      : chalk.greenBright('development')
  } mode`
)

log('Logs enabled!')

const ajv = new Ajv()
const validate = Object.fromEntries(
  Object.entries(schemas).map(([key, schema]) => [key, ajv.compile(schema)])
) as {
  [k in keyof typeof schemas]: ValidateFunction<JTDDataType<typeof schemas[k]>>
}
const app = express()
const server = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
  serveClient: false,
})

const app2 = new App({ io, prisma, validate, config })

app2.use(createMessenger, createGame)
app.use('/api', app2.api)

if (isProduction) {
  // @ts-expect-error Import from a JS file cannot be typed
  import('../build/handler.js')
    .then(({ handler }: Record<string, RequestHandler>) => {
      app.use(handler)
    })
    .catch((error) => {
      console.error(error)
    })
}

server.listen(port, () => {
  console.log(`Running on ${chalk.blue(`*:${port}`)}`)
  console.log()
})
