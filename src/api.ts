import type { CurrentState as Connect3State } from './games/connect3/types'
import type { CurrentState } from './games/quizz/types'
import type { Type } from './messenger/types'
import type { DetailedMessage, RichMessage, Team, User } from './types'

export enum Level {
  Banned = 0,
  Chat = 1,
  Moderator = 2,
  Admin = 3,
}

export enum GetRequest {
  Teams = '/teams',
  Messages = '/messages',
  ChatSettings = '/chat-settings',
  GameSettings = '/game-settings',
  GameState = '/game-results',
  Connect3State = '/connect3',
  UsersOnline = '/users-online',
}

export enum PostRequest {
  Login = '/login',
  Me = '/me',
  SetupGame = '/setup-game',
  QuizzAnswer = '/quizz-answer',
  Connect3Play = '/connect3-play',
}

export const schemas = {
  [PostRequest.Login]: {
    properties: {
      name: { type: 'string' },
      teamId: { type: 'int32' },
    },
  },
  [PostRequest.Me]: {
    properties: {
      token: { type: 'string' },
    },
  },
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
  [GetRequest.Teams]: Team[]
  [GetRequest.Messages]:
    | { type: Type.Basic; messages: RichMessage[] }
    | { type: Type.Detailed; messages: DetailedMessage[] }
  [GetRequest.ChatSettings]: { slowdown: number; moderationDelay: number }
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
  [PostRequest.Login]: { token: string } | { error: string }
  [PostRequest.Me]: (User & { team: Team }) | false
  [PostRequest.SetupGame]: void
  [PostRequest.QuizzAnswer]: void
  [PostRequest.Connect3Play]: void
}
