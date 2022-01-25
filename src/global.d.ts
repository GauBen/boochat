import type { Team, User } from '$/types'

// Environment variables
interface Env {
  VITE_API_PORT: string
  VITE_TENOR_API_KEY: string
}

global {
  namespace Express {
    interface Request {
      user: (User & { team: Team }) | undefined
    }
  }

  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }

  interface ImportMetaEnv extends Env {}
}

module 'socket.io' {
  export class Socket {
    user: (User & { team: Team }) | undefined
  }
}
