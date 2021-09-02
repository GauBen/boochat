import type { Type } from './messenger/types'
import type { Team, User, RichMessage, DetailedMessage } from './types'
import type { JTDDataType } from 'ajv/dist/core'

const API = `//${globalThis?.location?.hostname ?? 'localhost'}:3001/api`

export enum Level {
  Banned = 0,
  Chat = 1,
  Moderator = 2,
  Admin = 3,
}

export enum GetRequest {
  Teams = '/teams',
  Messages = '/messages',
  GameSettings = '/game-settings',
  GameResults = '/game-results',
  UsersOnline = '/users-online',
}

export enum PostRequest {
  Login = '/login',
  Me = '/me',
  SetupGame = '/setup-game',
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
} as const

export type Me = (User & { team: Team }) | false

export interface Response {
  [GetRequest.Teams]: Team[]
  [GetRequest.Messages]:
    | { type: Type.Basic; messages: RichMessage[] }
    | { type: Type.Detailed; messages: DetailedMessage[] }
  [GetRequest.GameSettings]: { value: string }
  [GetRequest.GameResults]: Array<[number, number]>
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
}

export const get = async <T extends GetRequest>(
  uri: T
): Promise<{ response: globalThis.Response; body: Response[T] }> => {
  const token = sessionStorage.getItem('token')
  const response = await fetch(API + uri, {
    headers: token
      ? {
          Authorization: `Token ${token}`,
        }
      : {},
  })
  const body = (await response.json()) as Response[T]
  return { response, body }
}

export const post = async <T extends PostRequest>(
  uri: T,
  requestBody: JTDDataType<typeof schemas[T]>
): Promise<{ response: globalThis.Response; body: Response[T] }> => {
  const token = sessionStorage.getItem('token')
  const response = await fetch(API + uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Token ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(requestBody),
  })
  const responseBody = (await response.json()) as Response[T]
  return { response, body: responseBody }
}
