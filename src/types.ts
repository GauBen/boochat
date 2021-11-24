import type { User, Team, Message } from '@prisma/client'

export type DetailedUser = User & { team: Team }
export type MessageUser = {
  id: User['id']
  name: User['name']
  teamId: Team['id']
  // A nice way to have TypeScript tell us that we are leaking this
  inpId?: never
}

export type RichMessage = Message & { author: MessageUser } & {
  visible: boolean
}
export type DetailedMessage = Message & { author: User } & {
  visible: boolean
}

export type {
  Question,
  Answer,
  QuestionStats,
  User,
  Team,
  Message,
} from '@prisma/client'
