import type { User, Team } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user: (User & { team: Team }) | undefined
    }
  }
}

declare module 'socket.io' {
  export class Socket {
    user: (User & { team: Team }) | undefined
  }
}
