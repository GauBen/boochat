import type { User, Team } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user: (User & { team: Team }) | undefined
    }
  }
}
