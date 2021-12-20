import type { User, Team } from './types'

declare global {
  namespace Express {
    interface Request {
      user: (User & { team: Team }) | undefined
    }
  }

  interface ImportMeta {
    env: {
      VITE_API_PORT: string
    }
  }
}

declare module 'socket.io' {
  export class Socket {
    user: (User & { team: Team }) | undefined
  }
}
