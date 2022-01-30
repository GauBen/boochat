import type { Team, User } from '$/types'

export enum Level {
  Banned = 0,
  Chat = 1,
  Moderator = 2,
  Admin = 3,
}

export type Me = (User & { team: Team }) | false
