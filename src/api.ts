import type { Team, User } from '$/types'
import type { CurrentState as Connect3State } from '$games/connect3/types'
import type { CurrentState } from '$games/quizz/types'

export enum Level {
  Banned = 0,
  Chat = 1,
  Moderator = 2,
  Admin = 3,
}

export enum GetRequest {
  GameSettings = '/game-settings',
  GameState = '/game-results',
  Connect3State = '/connect3',
  UsersOnline = '/users-online',
}

export enum PostRequest {
  SetupGame = '/setup-game',
  QuizzAnswer = '/quizz-answer',
  Connect3Play = '/connect3-play',
}

export const schemas = {
  [PostRequest.SetupGame]: {
    properties: {
      value: { type: 'string' },
    },
  },
  [PostRequest.QuizzAnswer]: {
    properties: {
      answer: { type: 'string' },
    },
  },
  [PostRequest.Connect3Play]: {
    properties: {
      move: { type: 'int32' },
    },
  },
} as const

export type Me = (User & { team: Team }) | false

export interface Response {
  [GetRequest.GameSettings]: { value: string }
  [GetRequest.GameState]: CurrentState
  [GetRequest.Connect3State]: Connect3State
  [GetRequest.UsersOnline]: {
    online: number
    connected: number
    users: Array<{
      user: User & { team: Team }
      online: number
    }>
  }
  [PostRequest.SetupGame]: void
  [PostRequest.QuizzAnswer]: void
  [PostRequest.Connect3Play]: void
}
